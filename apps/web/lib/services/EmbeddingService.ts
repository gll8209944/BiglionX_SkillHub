import { OpenAI } from 'openai';

/**
 * Embedding服务 - 使用OpenAI API生成文本向量
 * 
 * 注意: 由于Neon数据库不支持pgvector，embeddings存储为JSON格式
 * 未来可以迁移到支持pgvector的数据库（如Supabase）以启用向量搜索
 */
export class EmbeddingService {
  private openai: OpenAI | null = null;
  private provider: 'deepseek' | 'zhipu' | 'openai' = 'openai';
  
  /**
   * 懒加载 OpenAI 客户端
   * 只在首次使用时初始化，避免构建时失败
   */
  private getOpenAIClient(): OpenAI {
    if (this.openai) {
      return this.openai;
    }
    
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY 环境变量未设置');
    }
    
    // 自动检测API提供商
    const baseURL = process.env.OPENAI_BASE_URL;
    
    if (baseURL?.includes('bigmodel.cn')) {
      // 智谱AI
      this.provider = 'zhipu';
      this.openai = new OpenAI({
        apiKey,
        baseURL: baseURL || 'https://open.bigmodel.cn/api/paas/v4',
        timeout: 30000,
        maxRetries: 3,
      });
    } else if (baseURL?.includes('deepseek.com')) {
      // DeepSeek
      this.provider = 'deepseek';
      this.openai = new OpenAI({
        apiKey,
        baseURL: baseURL || 'https://api.deepseek.com',
        timeout: 30000,
        maxRetries: 3,
      });
    } else {
      // OpenAI (默认)
      this.provider = 'openai';
      this.openai = new OpenAI({
        apiKey,
        baseURL: baseURL || 'https://api.openai.com/v1',
        timeout: 30000,
        maxRetries: 3,
      });
    }
    
    return this.openai;
  }
  
  /**
   * 获取当前提供商的Embeddings模型名称
   */
  private getModelName(): string {
    switch (this.provider) {
      case 'zhipu':
        return 'embedding-2'; // 智谱AI推荐模型
      case 'deepseek':
        return 'deepseek-embed'; // DeepSeek模型
      case 'openai':
      default:
        return 'text-embedding-3-small'; // OpenAI模型
    }
  }
  
  /**
   * 生成单个文本的embedding
   * @param text - 要生成embedding的文本
   * @returns embedding向量数组 (维度取决于模型)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // 限制文本长度，避免超出token限制
      const truncatedText = this.truncateText(text, 8000);
      const model = this.getModelName();
      
      console.log(`📊 生成Embeddings - 模型: ${model}, 文本长度: ${truncatedText.length}`);
      
      const response = await this.getOpenAIClient().embeddings.create({
        model,
        input: truncatedText,
        encoding_format: 'float',
      });
      
      console.log(`✅ Embeddings生成成功 - 维度: ${response.data[0].embedding.length}`);
      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ 生成embedding失败:', error);
      throw error;
    }
  }
  
  /**
   * 批量生成embeddings
   * @param texts - 文本数组
   * @returns embeddings数组
   */
  async batchGenerateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // OpenAI API每次最多处理2048个输入
    const batchSize = 100; // 保守起见，使用较小的批次
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      try {
        const model = this.getModelName();
        console.log(`📊 批量生成Embeddings - 批次: ${i / batchSize + 1}, 模型: ${model}`);
        
        const response = await this.getOpenAIClient().embeddings.create({
          model,
          input: batch.map(text => this.truncateText(text, 8000)),
          encoding_format: 'float',
        });
        
        const batchEmbeddings = response.data.map((item: any) => item.embedding);
        embeddings.push(...batchEmbeddings);
        
        console.log(`✅ 批次 ${i / batchSize + 1} 完成 - 生成 ${batchEmbeddings.length} 个embeddings`);
        
        // 添加延迟以避免速率限制
        // 智谱AI: 每分钟20次请求
        // DeepSeek: 每分钟20次请求
        if (i + batchSize < texts.length) {
          const delay = this.provider === 'zhipu' || this.provider === 'deepseek' ? 3000 : 100;
          await this.sleep(delay);
        }
      } catch (error) {
        console.error(`❌ 批量生成embeddings失败 (批次 ${i / batchSize}):`, error);
        throw error;
      }
    }
    
    return embeddings;
  }
  
  /**
   * 为Skill生成embedding
   * @param skillData - Skill数据对象
   * @returns embedding向量
   */
  async generateSkillEmbedding(skillData: {
    name: string;
    description: string;
    tags?: string[];
    category?: string;
    readme?: string;
  }): Promise<number[]> {
    // 组合所有相关文本
    const textParts = [
      skillData.name,
      skillData.description,
      ...(skillData.tags || []),
      skillData.category || '',
      skillData.readme ? skillData.readme.substring(0, 2000) : '', // 限制readme长度
    ].filter(Boolean);
    
    const combinedText = textParts.join(' ');
    
    return this.generateEmbedding(combinedText);
  }
  
  /**
   * 计算两个embedding之间的余弦相似度
   * @param embedding1 - 第一个embedding
   * @param embedding2 - 第二个embedding
   * @returns 相似度 (0-1)
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings维度不匹配');
    }
    
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }
    
    return dotProduct / (norm1 * norm2);
  }
  
  /**
   * 截断文本到指定字符数
   * @param text - 原始文本
   * @param maxLength - 最大长度
   * @returns 截断后的文本
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
  
  /**
   * 延迟函数
   * @param ms - 毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例实例
export const embeddingService = new EmbeddingService();

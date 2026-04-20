// 测试EmbeddingService与智谱AI的集成
import { embeddingService } from './lib/services/EmbeddingService';

async function testEmbeddingIntegration() {
  console.log('🧪 测试 EmbeddingService 与智谱AI集成...\n');
  
  try {
    // 测试单个文本embedding
    console.log('📝 测试1: 生成单个embedding');
    const text = 'AI Agent Skill for inventory management and warehouse optimization';
    console.log(`文本: ${text}`);
    
    const embedding = await embeddingService.generateEmbedding(text);
    console.log(`✅ 成功!`);
    console.log(`   向量维度: ${embedding.length}`);
    console.log(`   前5个值: ${embedding.slice(0, 5).join(', ')}`);
    console.log('');
    
    // 测试批量生成
    console.log('📦 测试2: 批量生成embeddings');
    const texts = [
      'React hooks for state management',
      'Python machine learning libraries',
      'Docker containerization best practices'
    ];
    
    const embeddings = await embeddingService.batchGenerateEmbeddings(texts);
    console.log(`✅ 成功!`);
    console.log(`   生成数量: ${embeddings.length}`);
    console.log(`   每个维度: ${embeddings[0].length}`);
    console.log('');
    
    // 测试相似度计算
    console.log('🔍 测试3: 计算相似度');
    const sim1 = embeddingService.calculateSimilarity(embeddings[0], embeddings[1]);
    const sim2 = embeddingService.calculateSimilarity(embeddings[0], embeddings[0]);
    
    console.log(`✅ 成功!`);
    console.log(`   React vs Python 相似度: ${sim1.toFixed(4)}`);
    console.log(`   React vs React 相似度: ${sim2.toFixed(4)} (应该是1.0)`);
    console.log('');
    
    console.log('🎉 所有测试通过！EmbeddingService已正确集成智谱AI');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ 测试失败:', errorMessage);
    if (errorMessage.includes('速率限制')) {
      console.log('⏰ 触发速率限制，请等待几分钟后重试');
    }
    process.exit(1);
  }
}

testEmbeddingIntegration();

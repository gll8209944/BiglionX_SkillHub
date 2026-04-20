import { createClient } from 'redis';
import NodeCache from 'node-cache';

/**
 * Embeddings缓存服务
 * 
 * 提供多层缓存策略：
 * 1. 内存缓存（L1）- 快速访问，TTL短
 * 2. Redis缓存（L2）- 分布式缓存，TTL中等
 * 3. 数据库（L3）- 持久化存储
 */
export class EmbeddingCacheService {
  private memoryCache: NodeCache;
  private redisClient: ReturnType<typeof createClient> | null = null;
  private redisEnabled = false;
  
  // 缓存键前缀
  private readonly CACHE_KEY_PREFIX = 'embedding:';
  private readonly SEARCH_RESULT_PREFIX = 'search_result:';
  
  // TTL配置（秒）
  private readonly MEMORY_CACHE_TTL = 300;      // 5分钟
  private readonly REDIS_CACHE_TTL = 3600;      // 1小时
  private readonly SEARCH_RESULT_TTL = 1800;    // 30分钟
  
  constructor() {
    // 初始化内存缓存
    this.memoryCache = new NodeCache({
      stdTTL: this.MEMORY_CACHE_TTL,
      checkperiod: 60,
      maxKeys: 10000,
    });
    
    // 初始化Redis客户端
    this.initRedis();
    
    console.log('🔧 EmbeddingCacheService 初始化完成');
  }
  
  /**
   * 初始化Redis连接
   */
  private async initRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      this.redisClient = createClient({
        url: redisUrl,
      });
      
      this.redisClient.on('error', (err) => {
        console.error('❌ Redis连接错误:', err.message);
        this.redisEnabled = false;
      });
      
      this.redisClient.on('connect', () => {
        console.log('✅ Redis连接成功');
        this.redisEnabled = true;
      });
      
      await this.redisClient.connect();
    } catch (error) {
      console.warn('⚠️ Redis连接失败，将仅使用内存缓存:', error);
      this.redisEnabled = false;
    }
  }
  
  /**
   * 生成缓存键
   */
  private getEmbeddingCacheKey(text: string): string {
    // 使用简单的hash避免键过长
    const hash = this.simpleHash(text);
    return `${this.CACHE_KEY_PREFIX}${hash}`;
  }
  
  private getSearchResultCacheKey(query: string, filters: string): string {
    const hash = this.simpleHash(`${query}:${filters}`);
    return `${this.SEARCH_RESULT_PREFIX}${hash}`;
  }
  
  /**
   * 简单哈希函数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
  
  /**
   * 获取embedding（从缓存）
   * @param text - 原始文本
   * @returns embedding向量或null
   */
  async getEmbedding(text: string): Promise<number[] | null> {
    const cacheKey = this.getEmbeddingCacheKey(text);
    
    // 1. 尝试从内存缓存获取
    const memoryResult = this.memoryCache.get<number[]>(cacheKey);
    if (memoryResult) {
      console.log('💾 [L1] 内存缓存命中');
      return memoryResult;
    }
    
    // 2. 尝试从Redis获取
    if (this.redisEnabled && this.redisClient) {
      try {
        const redisResult = await this.redisClient.get(cacheKey);
        if (redisResult) {
          const embedding = JSON.parse(redisResult);
          console.log('💾 [L2] Redis缓存命中');
          
          // 回填到内存缓存
          this.memoryCache.set(cacheKey, embedding);
          
          return embedding;
        }
      } catch (error) {
        console.error('❌ Redis读取失败:', error);
      }
    }
    
    console.log('❌ 缓存未命中');
    return null;
  }
  
  /**
   * 设置embedding缓存
   * @param text - 原始文本
   * @param embedding - embedding向量
   */
  async setEmbedding(text: string, embedding: number[]): Promise<void> {
    const cacheKey = this.getEmbeddingCacheKey(text);
    
    // 1. 设置内存缓存
    this.memoryCache.set(cacheKey, embedding);
    
    // 2. 设置Redis缓存
    if (this.redisEnabled && this.redisClient) {
      try {
        await this.redisClient.setEx(
          cacheKey,
          this.REDIS_CACHE_TTL,
          JSON.stringify(embedding)
        );
      } catch (error) {
        console.error('❌ Redis写入失败:', error);
      }
    }
  }
  
  /**
   * 获取搜索结果缓存
   * @param query - 搜索查询
   * @param filters - 过滤条件JSON字符串
   * @returns 缓存的搜索结果或null
   */
  async getSearchResult(query: string, filters: string): Promise<any | null> {
    const cacheKey = this.getSearchResultCacheKey(query, filters);
    
    // 1. 尝试从内存缓存获取
    const memoryResult = this.memoryCache.get<any>(cacheKey);
    if (memoryResult) {
      console.log('💾 [L1] 搜索结果内存缓存命中');
      return memoryResult;
    }
    
    // 2. 尝试从Redis获取
    if (this.redisEnabled && this.redisClient) {
      try {
        const redisResult = await this.redisClient.get(cacheKey);
        if (redisResult) {
          const result = JSON.parse(redisResult);
          console.log('💾 [L2] 搜索结果Redis缓存命中');
          
          // 回填到内存缓存
          this.memoryCache.set(cacheKey, result);
          
          return result;
        }
      } catch (error) {
        console.error('❌ Redis读取失败:', error);
      }
    }
    
    return null;
  }
  
  /**
   * 设置搜索结果缓存
   * @param query - 搜索查询
   * @param filters - 过滤条件
   * @param result - 搜索结果
   */
  async setSearchResult(query: string, filters: string, result: any): Promise<void> {
    const cacheKey = this.getSearchResultCacheKey(query, filters);
    
    // 1. 设置内存缓存
    this.memoryCache.set(cacheKey, result);
    
    // 2. 设置Redis缓存
    if (this.redisEnabled && this.redisClient) {
      try {
        await this.redisClient.setEx(
          cacheKey,
          this.SEARCH_RESULT_TTL,
          JSON.stringify(result)
        );
      } catch (error) {
        console.error('❌ Redis写入失败:', error);
      }
    }
  }
  
  /**
   * 批量获取embeddings
   * @param texts - 文本数组
   * @returns Map<text, embedding>
   */
  async batchGetEmbeddings(texts: string[]): Promise<Map<string, number[]>> {
    const results = new Map<string, number[]>();
    const misses: string[] = [];
    
    // 尝试从缓存获取
    for (const text of texts) {
      const embedding = await this.getEmbedding(text);
      if (embedding) {
        results.set(text, embedding);
      } else {
        misses.push(text);
      }
    }
    
    console.log(`💾 批量缓存: ${results.size}/${texts.length} 命中`);
    
    return results;
  }
  
  /**
   * 批量设置embeddings
   * @param embeddingsMap - Map<text, embedding>
   */
  async batchSetEmbeddings(embeddingsMap: Map<string, number[]>): Promise<void> {
    for (const [text, embedding] of embeddingsMap.entries()) {
      await this.setEmbedding(text, embedding);
    }
    console.log(`💾 批量缓存设置: ${embeddingsMap.size} 个embeddings`);
  }
  
  /**
   * 清除特定缓存
   * @param text - 文本（可选，不指定则清除所有）
   */
  async invalidateCache(text?: string): Promise<void> {
    if (text) {
      const cacheKey = this.getEmbeddingCacheKey(text);
      this.memoryCache.del(cacheKey);
      
      if (this.redisEnabled && this.redisClient) {
        await this.redisClient.del(cacheKey);
      }
    } else {
      // 清除所有embedding缓存
      this.memoryCache.flushAll();
      
      if (this.redisEnabled && this.redisClient) {
        const keys = await this.redisClient.keys(`${this.CACHE_KEY_PREFIX}*`);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      }
    }
  }
  
  /**
   * 清除搜索结果缓存
   */
  async invalidateSearchCache(): Promise<void> {
    this.memoryCache.flushAll();
    
    if (this.redisEnabled && this.redisClient) {
      const keys = await this.redisClient.keys(`${this.SEARCH_RESULT_PREFIX}*`);
      if (keys.length > 0) {
        await this.redisClient.del(keys);
      }
    }
  }
  
  /**
   * 获取缓存统计信息
   */
  getStats() {
    const stats = this.memoryCache.getStats();
    return {
      memoryCache: {
        keys: stats.keys,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits / (stats.hits + stats.misses) || 0,
      },
      redisEnabled: this.redisEnabled,
    };
  }
  
  /**
   * 关闭连接
   */
  async shutdown() {
    this.memoryCache.flushAll();
    
    if (this.redisEnabled && this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

// 导出单例实例
export const embeddingCacheService = new EmbeddingCacheService();

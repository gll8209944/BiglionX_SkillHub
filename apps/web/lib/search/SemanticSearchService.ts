import { prisma } from '@/lib/prisma';
import { embeddingService } from '@/lib/services/EmbeddingService';
import { embeddingCacheService } from '@/lib/services/EmbeddingCacheService';
import { batchSearchOptimizer } from './BatchSearchOptimizer';

/**
 * 语义搜索结果
 */
export interface SemanticSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  languages: string[];
  qualityScore: number;
  starCount: number;
  downloadCount: number;
  authorName?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  source?: string;
  updatedAt: Date;
  similarity: number; // 相似度分数 (0-1)
}

/**
 * 语义搜索选项
 */
export interface SemanticSearchOptions {
  query: string;
  limit?: number;
  minSimilarity?: number; // 最小相似度阈值
  category?: string;
  language?: string;
  source?: string;
}

/**
 * 语义搜索服务
 * 
 * 基于向量相似度实现语义搜索功能
 */
export class SemanticSearchService {
  /**
   * 执行语义搜索（优化版）
   */
  async search(options: SemanticSearchOptions): Promise<SemanticSearchResult[]> {
    const {
      query,
      limit = 20,
      minSimilarity = 0.3,
      category,
      language,
      source,
    } = options;

    try {
      console.log(`🔍 开始语义搜索: "${query}"`);

      // 1. 检查搜索结果缓存
      const filters = JSON.stringify({ category, language, source, minSimilarity });
      const cachedResult = await embeddingCacheService.getSearchResult(query, filters);
      
      if (cachedResult) {
        console.log('💾 使用缓存的搜索结果');
        return cachedResult;
      }

      // 2. 生成查询文本的embedding（带缓存）
      let queryEmbedding = await embeddingCacheService.getEmbedding(query);
      
      if (!queryEmbedding) {
        console.log('📊 生成查询embedding...');
        queryEmbedding = await embeddingService.generateEmbedding(query);
        
        // 缓存embedding
        await embeddingCacheService.setEmbedding(query, queryEmbedding);
      } else {
        console.log('💾 使用缓存的查询embedding');
      }
      
      // 3. 使用优化的向量搜索（优先使用pgvector）
      const results = await batchSearchOptimizer.vectorSearch(queryEmbedding, {
        limit,
        minSimilarity,
        category,
        language,
        source,
      });

      console.log(`✅ 语义搜索完成，返回 ${results.length} 个结果`);
      
      // 4. 缓存搜索结果
      await embeddingCacheService.setSearchResult(query, filters, results);
      
      return results;
    } catch (error) {
      console.error('❌ 语义搜索失败:', error);
      throw error;
    }
  }

  /**
   * 获取相关Skills（基于给定Skill的embedding）优化版
   */
  async getRelatedSkills(
    skillId: string,
    limit = 5,
    minSimilarity = 0.5
  ): Promise<SemanticSearchResult[]> {
    try {
      console.log(`🔗 获取Skill ${skillId} 的相关技能`);

      // 1. 检查缓存
      const cacheKey = `related:${skillId}:${limit}:${minSimilarity}`;
      const cachedResult = await embeddingCacheService.getSearchResult(cacheKey, '');
      
      if (cachedResult) {
        console.log('💾 使用缓存的相关Skills');
        return cachedResult;
      }

      // 2. 获取目标skill的embedding
      const targetSkill = await prisma.skill.findUnique({
        where: { id: skillId },
        select: {
          id: true,
          embeddingVector: true,
          embedding: true,
        },
      });

      if (!targetSkill) {
        console.warn(`⚠️ Skill ${skillId} 不存在`);
        return [];
      }

      // 优先使用pgvector格式，回退到JSON格式
      let targetEmbedding: number[] | null = null;
      
      if (targetSkill.embeddingVector && Array.isArray(targetSkill.embeddingVector) && targetSkill.embeddingVector.length > 0) {
        targetEmbedding = targetSkill.embeddingVector as number[];
      } else if (targetSkill.embedding) {
        targetEmbedding = Array.isArray(targetSkill.embedding)
          ? targetSkill.embedding as number[]
          : JSON.parse(JSON.stringify(targetSkill.embedding));
      }

      if (!targetEmbedding) {
        console.warn(`⚠️ Skill ${skillId} 没有embedding`);
        return [];
      }

      // 3. 使用优化的向量搜索
      const results = await batchSearchOptimizer.vectorSearch(targetEmbedding, {
        limit: limit + 1, // 多取一个，后面排除自己
        minSimilarity,
      });

      // 4. 排除目标skill自己
      const filteredResults = results.filter(r => r.id !== skillId).slice(0, limit);
      
      console.log(`✅ 找到 ${filteredResults.length} 个相关技能`);
      
      // 5. 缓存结果
      await embeddingCacheService.setSearchResult(cacheKey, '', filteredResults);
      
      return filteredResults;
    } catch (error) {
      console.error('❌ 获取相关技能失败:', error);
      throw error;
    }
  }

  /**
   * 批量为Skills生成embeddings
   */
  async generateEmbeddingsForSkills(
    skillIds: string[],
    batchSize = 10
  ): Promise<number> {
    let successCount = 0;

    try {
      console.log(`📊 开始为 ${skillIds.length} 个Skills生成embeddings`);

      // 分批处理以避免API速率限制
      for (let i = 0; i < skillIds.length; i += batchSize) {
        const batch = skillIds.slice(i, i + batchSize);
        
        // 获取这批skills的数据
        const skills = await prisma.skill.findMany({
          where: { id: { in: batch } },
          select: {
            id: true,
            name: true,
            description: true,
            tags: true,
            category: true,
            readme: true,
          },
        });

        // 为每个skill生成embedding
        for (const skill of skills) {
          try {
            const embedding = await embeddingService.generateSkillEmbedding({
              name: skill.name,
              description: skill.description,
              tags: skill.tags,
              category: skill.category,
              readme: skill.readme || undefined,
            });

            // 更新数据库
            await prisma.skill.update({
              where: { id: skill.id },
              data: { embedding },
            });

            successCount++;
            console.log(`✅ Skill "${skill.name}" embedding生成成功`);
            
            // 添加延迟避免速率限制
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error(`❌ Skill "${skill.name}" embedding生成失败:`, error);
          }
        }

        // 批次间添加延迟
        if (i + batchSize < skillIds.length) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      console.log(`✅ Embeddings生成完成: ${successCount}/${skillIds.length}`);
      return successCount;
    } catch (error) {
      console.error('❌ 批量生成embeddings失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const semanticSearchService = new SemanticSearchService();

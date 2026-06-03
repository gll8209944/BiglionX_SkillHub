/**
 * KnowledgeEmbeddingService - 知识片段向量化服务
 * 基于现有的 EmbeddingService，支持知识片段的分块、向量化和向量检索
 */
import { prisma } from '@/lib/prisma';
import { embeddingService } from './EmbeddingService';
import type { Prisma } from '@prisma/client';

export interface VectorSearchResult {
  chunkIndex: number;
  chunkText: string;
  score: number;
  metadata: Record<string, unknown>;
}

export class KnowledgeEmbeddingService {
  /**
   * 对知识片段进行分块
   */
  chunkContent(content: unknown, contentType: string): string[] {
    const chunks: string[] = [];

    if (contentType === 'csv' && Array.isArray(content)) {
      // CSV 按行拆分
      content.forEach((row, index) => {
        const rowStr = Object.entries(row as Record<string, unknown>)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        chunks.push(`[行 ${index + 1}] ${rowStr}`);
      });
    } else if (contentType === 'json') {
      if (Array.isArray(content)) {
        // JSON 数组按元素拆分
        content.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            const itemStr = Object.entries(item as Record<string, unknown>)
              .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
              .join(', ');
            chunks.push(`[条目 ${index + 1}] ${itemStr}`);
          } else {
            chunks.push(`[条目 ${index + 1}] ${String(item)}`);
          }
        });
      } else if (typeof content === 'object' && content !== null) {
        // JSON 对象按顶层键值对拆分
        Object.entries(content as Record<string, unknown>).forEach(([key, value]) => {
          const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
          chunks.push(`${key}: ${valueStr}`);
        });
      } else {
        chunks.push(String(content));
      }
    } else {
      // text 类型，按段落拆分
      const text = String(content);
      const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
      paragraphs.forEach((p, i) => chunks.push(`[段落 ${i + 1}] ${p.trim()}`));
    }

    return chunks.filter((c) => c.length > 0);
  }

  /**
   * 生成知识片段的向量化嵌入
   */
  async generateFragmentEmbeddings(skillId: string): Promise<number> {
    const fragment = await prisma.knowledgeFragment.findUnique({ where: { skillId } });
    if (!fragment) {
      throw new Error(`Skill ${skillId} 不存在知识片段`);
    }

    const content = fragment.content as unknown;
    if (!content) {
      throw new Error('知识片段内容为空');
    }

    // 分块
    const chunks = this.chunkContent(content, fragment.contentType);
    if (chunks.length === 0) {
      throw new Error('无法拆分知识片段内容');
    }

    // 删除旧的嵌入
    await prisma.knowledgeEmbedding.deleteMany({ where: { skillId } });

    // 生成嵌入并保存
    const embeddings: Array<{ chunkIndex: number; chunkText: string; embedding: number[]; metadata: Prisma.InputJsonValue }> = [];

    for (let i = 0; i < chunks.length; i++) {
      try {
        const vector = await embeddingService.generateEmbedding(chunks[i]);
        const metadata: Record<string, unknown> = {
          chunk: i + 1,
          totalChunks: chunks.length,
          contentType: fragment.contentType,
        };

        embeddings.push({
          chunkIndex: i,
          chunkText: chunks[i],
          embedding: vector,
          metadata: metadata as Prisma.InputJsonValue,
        });
      } catch (error) {
        console.error(`生成向量失败 (chunk ${i}):`, error);
        // 继续处理其他块
      }
    }

    // 批量保存嵌入
    if (embeddings.length > 0) {
      await prisma.knowledgeEmbedding.createMany({
        data: embeddings.map((e) => ({
          skillId,
          knowledgeId: fragment.id,
          chunkIndex: e.chunkIndex,
          chunkText: e.chunkText,
          embedding: e.embedding,
          metadata: e.metadata,
        })),
      });

      // 更新知识片段状态
      await prisma.knowledgeFragment.update({
        where: { skillId },
        data: {
          vectorized: true,
          chunkCount: embeddings.length,
        },
      });
    }

    return embeddings.length;
  }

  /**
   * 向量相似度搜索
   */
  async vectorSearch(
    skillId: string,
    query: string,
    topK = 5,
    threshold = 0.7
  ): Promise<VectorSearchResult[]> {
    // 生成查询文本的向量
    let queryVector: number[];
    try {
      queryVector = await embeddingService.generateEmbedding(query);
    } catch (error) {
      console.error('生成查询向量失败:', error);
      return [];
    }

    return this.vectorSearchByEmbedding(skillId, queryVector, topK, threshold);
  }

  /**
   * 使用已有向量进行检索
   */
  async vectorSearchByEmbedding(
    skillId: string,
    queryEmbedding: number[],
    topK = 5,
    threshold = 0.7
  ): Promise<VectorSearchResult[]> {
    // 获取所有嵌入
    const embeddings = await prisma.knowledgeEmbedding.findMany({
      where: { skillId },
    });

    if (embeddings.length === 0) {
      return [];
    }

    // 计算相似度并排序
    const results: VectorSearchResult[] = embeddings
      .map((e: { chunkIndex: number; chunkText: string; embedding: number[]; metadata: unknown }) => {
        const score = this.cosineSimilarity(queryEmbedding, e.embedding);
        return {
          chunkIndex: e.chunkIndex,
          chunkText: e.chunkText,
          score,
          metadata: (e.metadata as Record<string, unknown>) || {},
        };
      })
      .filter((r: VectorSearchResult) => r.score >= threshold)
      .sort((a: VectorSearchResult, b: VectorSearchResult) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  /**
   * 重新索引所有知识片段嵌入
   */
  async reindexEmbeddings(skillId: string): Promise<number> {
    return this.generateFragmentEmbeddings(skillId);
  }

  /**
   * 计算余弦相似度
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// 导出单例
export const knowledgeEmbeddingService = new KnowledgeEmbeddingService();

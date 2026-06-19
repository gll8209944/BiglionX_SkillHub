/**
 * KnowledgeService - 知识片段管理服务
 * 支持知识片段的创建、更新、版本控制、CSV/JSON 解析
 */
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export type ContentType = 'json' | 'csv' | 'text';

export interface CreateKnowledgeInput {
  skillId: string;
  contentType: ContentType;
  content: Record<string, unknown> | unknown[];
  rawContent?: string;
  changelog?: string;
  createdBy?: string;
}

export interface UpdateKnowledgeInput {
  content: Record<string, unknown> | unknown[];
  rawContent?: string;
  changelog?: string;
  createdBy?: string;
}

export interface KnowledgeFragmentResult {
  id: string;
  skillId: string;
  version: number;
  contentType: string;
  content: unknown;
  rawContent: string | null;
  vectorized: boolean;
  chunkCount: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeService {
  /**
   * 创建知识片段
   */
  async createFragment(input: CreateKnowledgeInput): Promise<KnowledgeFragmentResult> {
    const { skillId, contentType, content, rawContent, changelog, createdBy } = input;

    // 检查 skill 是否存在
    const skill = await prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) {
      throw new Error(`Skill ${skillId} 不存在`);
    }

    // 检查是否已存在知识片段
    const existing = await prisma.knowledgeFragment.findUnique({ where: { skillId } });
    if (existing) {
      throw new Error(`Skill ${skillId} 已存在知识片段，请使用 updateFragment`);
    }

    // 解析内容生成元数据
    const metadata = this.extractMetadata(content, contentType);

    // 创建知识片段
    const fragment = await prisma.knowledgeFragment.create({
      data: {
        skillId,
        contentType,
        content: content as Prisma.InputJsonValue,
        rawContent: rawContent || null,
        version: 1,
        metadata: metadata as Prisma.InputJsonValue,
        vectorized: false,
        chunkCount: 0,
      },
    });

    // 创建初始版本记录
    await prisma.knowledgeVersion.create({
      data: {
        skillId,
        knowledgeId: fragment.id,
        version: 1,
        contentSnapshot: { contentType, content, rawContent } as Prisma.InputJsonValue,
        changelog: changelog || '初始版本',
        createdBy: createdBy || null,
      },
    });

    return this.toResult(fragment);
  }

  /**
   * 获取知识片段
   */
  async getFragment(skillId: string, version?: number): Promise<KnowledgeFragmentResult | null> {
    if (version) {
      // 获取指定版本快照
      const versionRecord = await prisma.knowledgeVersion.findFirst({
        where: { skillId, version },
        orderBy: { createdAt: 'desc' },
      });
      if (!versionRecord) return null;

      const snapshot = versionRecord.contentSnapshot as Record<string, unknown> | null;
      const fragment = await prisma.knowledgeFragment.findUnique({ where: { skillId } });

      return {
        id: versionRecord.knowledgeId,
        skillId: versionRecord.skillId,
        version: versionRecord.version,
        contentType: (snapshot?.contentType as string) || 'json',
        content: snapshot?.content || null,
        rawContent: (snapshot?.rawContent as string) || null,
        vectorized: fragment?.vectorized || false,
        chunkCount: fragment?.chunkCount || 0,
        metadata: {},
        createdAt: versionRecord.createdAt,
        updatedAt: versionRecord.createdAt,
      };
    }

    const fragment = await prisma.knowledgeFragment.findUnique({ where: { skillId } });
    return fragment ? this.toResult(fragment) : null;
  }

  /**
   * 更新知识片段（自动版本+1）
   */
  async updateFragment(skillId: string, input: UpdateKnowledgeInput): Promise<KnowledgeFragmentResult> {
    const existing = await prisma.knowledgeFragment.findUnique({ where: { skillId } });
    if (!existing) {
      throw new Error(`Skill ${skillId} 不存在知识片段`);
    }

    const newVersion = existing.version + 1;
    const metadata = this.extractMetadata(input.content, existing.contentType as ContentType);

    // 更新知识片段
    const updated = await prisma.knowledgeFragment.update({
      where: { skillId },
      data: {
        content: input.content as Prisma.InputJsonValue,
        rawContent: input.rawContent || null,
        version: newVersion,
        metadata: metadata as Prisma.InputJsonValue,
        vectorized: false,
        chunkCount: 0,
      },
    });

    // 创建新版本记录
    await prisma.knowledgeVersion.create({
      data: {
        skillId,
        knowledgeId: existing.id,
        version: newVersion,
        contentSnapshot: {
          contentType: existing.contentType,
          content: input.content,
          rawContent: input.rawContent,
          updatedAt: new Date().toISOString(),
        } as Prisma.InputJsonValue,
        changelog: input.changelog || `版本 ${newVersion}`,
        createdBy: input.createdBy || null,
      },
    });

    // 清理过旧的版本（保留最近 20 个版本）
    await this.cleanupOldVersions(skillId, existing.id);

    return this.toResult(updated);
  }

  /**
   * 获取版本历史
   */
  async getVersionHistory(skillId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [versions, total] = await Promise.all([
      prisma.knowledgeVersion.findMany({
        where: { skillId },
        orderBy: { version: 'desc' },
        skip,
        take: limit,
      }),
      prisma.knowledgeVersion.count({ where: { skillId } }),
    ]);

    return {
      versions: versions.map((v) => ({
        id: v.id,
        version: v.version,
        changelog: v.changelog,
        createdBy: v.createdBy,
        createdAt: v.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * 回滚到指定版本
   */
  async rollback(skillId: string, targetVersion: number, createdBy?: string): Promise<KnowledgeFragmentResult> {
    const target = await prisma.knowledgeVersion.findFirst({
      where: { skillId, version: targetVersion },
      orderBy: { createdAt: 'desc' },
    });
    if (!target) {
      throw new Error(`版本 ${targetVersion} 不存在`);
    }

    const snapshot = target.contentSnapshot as Record<string, unknown> | null;
    if (!snapshot) {
      throw new Error('版本快照数据为空');
    }

    const content = snapshot.content as Record<string, unknown> | unknown[];
    const rawContent = snapshot.rawContent as string | undefined;

    return this.updateFragment(skillId, {
      content,
      rawContent,
      changelog: `回滚到版本 ${targetVersion}`,
      createdBy,
    });
  }

  /**
   * 解析 CSV 文本为结构化数据
   */
  parseCSV(rawText: string): { headers: string[]; rows: Record<string, string>[]; preview: Record<string, string>[] } {
    const lines = rawText.trim().split('\n').filter(Boolean);
    if (lines.length < 1) {
      return { headers: [], rows: [], preview: [] };
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map((line) => {
      const values = this.parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });

    return {
      headers,
      rows,
      preview: rows.slice(0, 5),
    };
  }

  /**
   * 解析单行 CSV（支持引号转义）
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  }

  /**
   * 校验 JSON 内容
   */
  parseJSON(rawJson: string): { valid: boolean; data: unknown; error?: string; preview: unknown } {
    try {
      const data = JSON.parse(rawJson);
      const preview = Array.isArray(data) ? data.slice(0, 5) : data;
      return { valid: true, data, preview };
    } catch (error) {
      return { valid: false, data: null, error: (error as Error).message, preview: null };
    }
  }

  /**
   * 提取内容元数据
   */
  private extractMetadata(content: unknown, contentType: ContentType): Record<string, unknown> {
    const metadata: Record<string, unknown> = {
      source: 'manual',
      size_bytes: JSON.stringify(content).length,
    };

    if (contentType === 'csv' && Array.isArray(content)) {
      metadata.row_count = content.length;
      if (content.length > 0 && typeof content[0] === 'object') {
        metadata.columns = Object.keys(content[0] as Record<string, unknown>);
      }
    } else if (contentType === 'json') {
      if (Array.isArray(content)) {
        metadata.row_count = content.length;
        if (content.length > 0 && typeof content[0] === 'object') {
          metadata.columns = Object.keys(content[0] as Record<string, unknown>);
        }
      } else if (typeof content === 'object' && content !== null) {
        metadata.columns = Object.keys(content as Record<string, unknown>);
      }
    }

    return metadata;
  }

  /**
   * 清理过旧的版本（保留最近 20 个）
   */
  private async cleanupOldVersions(skillId: string, knowledgeId: string): Promise<void> {
    const versions = await prisma.knowledgeVersion.findMany({
      where: { skillId, knowledgeId },
      orderBy: { version: 'desc' },
      skip: 20,
      select: { id: true },
    });

    if (versions.length > 0) {
      await prisma.knowledgeVersion.deleteMany({
        where: { id: { in: versions.map((v) => v.id) } },
      });
    }
  }

  /**
   * 转换为返回结果
   */
  private toResult(fragment: {
    id: string;
    skillId: string;
    version: number;
    contentType: string;
    content: unknown;
    rawContent: string | null;
    vectorized: boolean;
    chunkCount: number;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  }): KnowledgeFragmentResult {
    return {
      id: fragment.id,
      skillId: fragment.skillId,
      version: fragment.version,
      contentType: fragment.contentType,
      content: fragment.content,
      rawContent: fragment.rawContent,
      vectorized: fragment.vectorized,
      chunkCount: fragment.chunkCount,
      metadata: (fragment.metadata as Record<string, unknown>) || {},
      createdAt: fragment.createdAt,
      updatedAt: fragment.updatedAt,
    };
  }
}

// 导出单例
export const knowledgeService = new KnowledgeService();

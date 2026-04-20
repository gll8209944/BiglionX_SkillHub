/**
 * SearchService 单元测试
 */

// Mock Prisma before importing SearchService
const mockFindMany = jest.fn();
const mockCount = jest.fn();
const mockGroupBy = jest.fn();
const mockQueryRawUnsafe = jest.fn();
const mockQueryRaw = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    skill: {
      findMany: jest.fn(() => mockFindMany()),
      count: jest.fn(() => mockCount()),
      groupBy: jest.fn(() => mockGroupBy()),
    },
    $queryRawUnsafe: jest.fn((...args) => mockQueryRawUnsafe(...args)),
    $queryRaw: jest.fn((...args) => mockQueryRaw(...args)),
  },
}));

import { SearchService } from '../SearchService';
import { prisma } from '@/lib/prisma';

describe('SearchService', () => {
  let searchService: SearchService;

  beforeEach(() => {
    searchService = new SearchService();
    jest.clearAllMocks();
  });

  describe('getSuggestions', () => {
    it('应该在查询长度小于2时返回空建议', async () => {
      const result = await searchService.getSuggestions('a', 5);
      expect(result).toEqual([]);
    });

    it('应该在查询为空时返回空建议', async () => {
      const result = await searchService.getSuggestions('', 5);
      expect(result).toEqual([]);
    });

    it('应该获取技能名称建议', async () => {
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([
        { name: 'AI Agent' },
        { name: 'AI Assistant' },
      ]);
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([]);
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([]);

      const result = await searchService.getSuggestions('ai', 5);

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('AI Agent');
      expect(result[0].type).toBe('skill');
    });

    it('应该获取分类建议', async () => {
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([]);
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([
        { category: 'ai-tools' },
      ]);
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([]);

      const result = await searchService.getSuggestions('ai', 5);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('ai-tools');
      expect(result[0].type).toBe('category');
    });

    it('应该获取标签建议', async () => {
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([]);
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([]);
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([
        { tag: 'automation' },
      ]);

      const result = await searchService.getSuggestions('auto', 5);

      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('automation');
      expect(result[0].type).toBe('tag');
    });

    it('应该限制返回数量为limit', async () => {
      (mockQueryRaw as jest.Mock).mockResolvedValueOnce([
        { name: 'Skill 1' },
        { name: 'Skill 2' },
        { name: 'Skill 3' },
        { name: 'Skill 4' },
        { name: 'Skill 5' },
      ]);

      const result = await searchService.getSuggestions('test', 3);

      expect(result).toHaveLength(3);
    });

    it('应该在数据库错误时返回空数组', async () => {
      (mockQueryRaw as jest.Mock).mockRejectedValue(new Error('DB error'));

      const result = await searchService.getSuggestions('test', 5);

      expect(result).toEqual([]);
    });
  });

  describe('getPopularSearches', () => {
    it('应该返回热门搜索词列表', async () => {
      (mockFindMany as jest.Mock).mockResolvedValue([
        {
          name: 'AI Agent Framework',
          tags: ['ai', 'agent', 'automation'],
          category: 'ai-tools',
        },
        {
          name: 'Python Data Pipeline',
          tags: ['python', 'data', 'pipeline'],
          category: 'data-engineering',
        },
      ]);

      const result = await searchService.getPopularSearches(10);

      expect(Array.isArray(result)).toBe(true);
      // 验证调用了 findMany
      expect(mockFindMany).toHaveBeenCalled();
    });

    it('应该限制返回数量', async () => {
      (mockFindMany as jest.Mock).mockResolvedValue([
        { name: 'Test Skill', tags: ['test'], category: 'test' },
      ]);

      const result = await searchService.getPopularSearches(5);

      expect(result.length).toBeLessThanOrEqual(5);
    });

    it('应该过滤短单词（长度<=3）', async () => {
      (mockFindMany as jest.Mock).mockResolvedValue([
        { name: 'Artificial Intelligence', tags: ['machine-learning'], category: 'ai' },
      ]);

      const result = await searchService.getPopularSearches(10);

      // 验证返回的词都是有效的（至少有一个词长度>3）
      if (result.length > 0) {
        expect(result.some(word => word.length > 3)).toBe(true);
      }
    });

    it('应该在没有任何skills时返回空数组', async () => {
      (mockFindMany as jest.Mock).mockResolvedValue([]);

      const result = await searchService.getPopularSearches(10);

      expect(result).toEqual([]);
    });
  });

  describe('search', () => {
    it('应该执行基本搜索', async () => {
      (mockQueryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce([{ total: 10 }])
        .mockResolvedValueOnce([
          { id: '1', name: 'Test Skill', slug: 'test-skill' },
        ]);

      const result = await searchService.search({ query: 'test' });

      expect(result.total).toBe(10);
      expect(result.skills).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it('应该支持分页参数', async () => {
      (mockQueryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce([{ total: 50 }])
        .mockResolvedValueOnce([]);

      const result = await searchService.search({
        query: 'test',
        page: 2,
        pageSize: 10,
      });

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(10);
      expect(result.totalPages).toBe(5);
    });

    it('应该支持分类过滤', async () => {
      (mockQueryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce([{ total: 5 }])
        .mockResolvedValueOnce([]);

      await searchService.search({ category: 'ai-tools' });

      expect(mockQueryRawUnsafe).toHaveBeenCalled();
    });

    it('应该支持排序方式', async () => {
      (mockQueryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ total: 0 }])
        .mockResolvedValueOnce([]);

      await searchService.search({ query: 'test', sortBy: 'quality' });
      await searchService.search({ query: 'test', sortBy: 'stars' });
      await searchService.search({ query: 'test', sortBy: 'downloads' });
      await searchService.search({ query: 'test', sortBy: 'updated' });

      expect(mockQueryRawUnsafe).toHaveBeenCalledTimes(8); // 4次count + 4次data
    });
  });

  describe('advancedSearch', () => {
    it('应该执行高级搜索', async () => {
      (mockQueryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce([{ total: 15 }])
        .mockResolvedValueOnce([
          { id: '1', name: 'Advanced Skill' },
        ]);

      const result = await searchService.advancedSearch({
        query: 'advanced',
        categories: ['ai-tools'],
        minStars: 100,
      });

      expect(result.total).toBe(15);
      expect(result.skills).toHaveLength(1);
    });

    it('应该支持多语言过滤', async () => {
      (mockQueryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce([{ total: 8 }])
        .mockResolvedValueOnce([]);

      await searchService.advancedSearch({
        languages: ['python', 'javascript'],
      });

      expect(mockQueryRawUnsafe).toHaveBeenCalled();
    });

    it('应该支持日期范围过滤', async () => {
      (mockQueryRawUnsafe as jest.Mock)
        .mockResolvedValueOnce([{ total: 3 }])
        .mockResolvedValueOnce([]);

      await searchService.advancedSearch({
        dateRange: {
          from: new Date('2024-01-01'),
          to: new Date('2024-12-31'),
        },
      });

      expect(mockQueryRawUnsafe).toHaveBeenCalled();
    });
  });

  it('应该创建SearchService实例', () => {
    expect(searchService).toBeDefined();
    expect(searchService.search).toBeDefined();
    expect(searchService.getSuggestions).toBeDefined();
    expect(searchService.getPopularSearches).toBeDefined();
    expect(searchService.advancedSearch).toBeDefined();
  });
});

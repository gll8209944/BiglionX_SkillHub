/**
 * Popular Searches API 单元测试
 * 
 * 测试 /api/search/popular 端点
 */

import { NextRequest } from 'next/server';

// Mock SearchService
jest.mock('@/lib/search/SearchService', () => {
  const mockFn = jest.fn();
  
  return {
    SearchService: jest.fn().mockImplementation(() => ({
      getPopularSearches: mockFn,
    })),
    // Export for testing
    __mockGetPopularSearches: mockFn,
  };
});

// Now import the route handler
import { GET } from '../search/popular/route';

// Get reference to the mocked function
const { __mockGetPopularSearches } = jest.requireMock('@/lib/search/SearchService');

describe('Popular Searches API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search/popular', () => {
    it('应该返回热门搜索词列表', async () => {
      // Mock 热门搜索结果
      __mockGetPopularSearches.mockResolvedValue([
        { term: 'ai agent', count: 1500, trend: 'up' },
        { term: 'python', count: 1200, trend: 'stable' },
        { term: 'react', count: 950, trend: 'down' },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.popularSearches).toHaveLength(3);
      expect(data.popularSearches[0].term).toBe('ai agent');
      expect(__mockGetPopularSearches).toHaveBeenCalledWith(10);
    });

    it('应该支持自定义limit参数', async () => {
      __mockGetPopularSearches.mockResolvedValue([
        { term: 'test', count: 100, trend: 'up' },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular?limit=5'
      );
      await GET(request);

      expect(__mockGetPopularSearches).toHaveBeenCalledWith(5);
    });

    it('应该限制最大limit为20', async () => {
      __mockGetPopularSearches.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular?limit=50'
      );
      await GET(request);

      expect(__mockGetPopularSearches).toHaveBeenCalledWith(20);
    });

    it('应该使用默认limit值10', async () => {
      __mockGetPopularSearches.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular'
      );
      await GET(request);

      expect(__mockGetPopularSearches).toHaveBeenCalledWith(10);
    });

    it('应该处理SearchService错误', async () => {
      __mockGetPopularSearches.mockRejectedValue(new Error('Cache connection failed'));

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('获取热门搜索失败');
      expect(data.details).toBe('Cache connection failed');
      expect(data.popularSearches).toEqual([]);
    });

    it('应该返回空数组当没有热门数据时', async () => {
      __mockGetPopularSearches.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.popularSearches).toEqual([]);
    });

    it('应该正确处理limit为1的情况', async () => {
      __mockGetPopularSearches.mockResolvedValue([
        { term: 'top', count: 500, trend: 'up' },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular?limit=1'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.popularSearches).toHaveLength(1);
      expect(__mockGetPopularSearches).toHaveBeenCalledWith(1);
    });

    it('应该包含趋势信息', async () => {
      __mockGetPopularSearches.mockResolvedValue([
        { term: 'trending', count: 800, trend: 'up' },
        { term: 'stable', count: 600, trend: 'stable' },
        { term: 'declining', count: 400, trend: 'down' },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.popularSearches[0].trend).toBe('up');
      expect(data.popularSearches[1].trend).toBe('stable');
      expect(data.popularSearches[2].trend).toBe('down');
    });

    it('应该按搜索次数降序排列', async () => {
      __mockGetPopularSearches.mockResolvedValue([
        { term: 'most', count: 1000, trend: 'up' },
        { term: 'second', count: 800, trend: 'stable' },
        { term: 'third', count: 600, trend: 'down' },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(data.popularSearches[0].count).toBeGreaterThanOrEqual(
        data.popularSearches[1].count
      );
      expect(data.popularSearches[1].count).toBeGreaterThanOrEqual(
        data.popularSearches[2].count
      );
    });
  });

  describe('边界情况', () => {
    it('应该处理limit为0的情况', async () => {
      __mockGetPopularSearches.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular?limit=0'
      );
      await GET(request);

      expect(__mockGetPopularSearches).toHaveBeenCalledWith(0);
    });

    it('应该处理limit为负数的情况', async () => {
      __mockGetPopularSearches.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular?limit=-10'
      );
      await GET(request);

      // Math.min(-10, 20) = -10
      expect(__mockGetPopularSearches).toHaveBeenCalledWith(-10);
    });

    it('应该处理无效的limit参数', async () => {
      __mockGetPopularSearches.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular?limit=xyz'
      );
      await GET(request);

      // parseInt('xyz') = NaN
      expect(__mockGetPopularSearches).toHaveBeenCalled();
    });

    it('应该处理未知错误类型', async () => {
      __mockGetPopularSearches.mockRejectedValue('Unknown error');

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('获取热门搜索失败');
      expect(data.details).toBe('Unknown error');
    });

    it('应该在数据库超时时返回错误', async () => {
      __mockGetPopularSearches.mockRejectedValue(
        new Error('Connection timeout after 5000ms')
      );

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.details).toContain('timeout');
    });
  });

  describe('性能相关', () => {
    it('应该快速响应小limit请求', async () => {
      __mockGetPopularSearches.mockResolvedValue([
        { term: 'fast', count: 100, trend: 'up' },
      ]);

      const startTime = Date.now();
      const request = new NextRequest(
        'http://localhost:3000/api/search/popular?limit=1'
      );
      await GET(request);
      const endTime = Date.now();

      // Mock 情况下应该非常快
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('应该能处理大limit请求', async () => {
      const largeResult = Array.from({ length: 20 }, (_, i) => ({
        term: `term${i}`,
        count: 1000 - i * 10,
        trend: 'stable',
      }));

      __mockGetPopularSearches.mockResolvedValue(largeResult);

      const request = new NextRequest(
        'http://localhost:3000/api/search/popular?limit=20'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.popularSearches).toHaveLength(20);
    });
  });
});

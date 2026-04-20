/**
 * Search API 集成测试
 * 
 * 测试 /api/search 端点的GET和POST方法
 */

import { NextRequest } from 'next/server';

// Mock SearchService
const mockSearch = jest.fn();
const mockAdvancedSearch = jest.fn();

jest.mock('@/lib/search/SearchService', () => {
  const mockSearchFn = jest.fn();
  const mockAdvancedSearchFn = jest.fn();
  
  return {
    SearchService: jest.fn().mockImplementation(() => ({
      search: mockSearchFn,
      advancedSearch: mockAdvancedSearchFn,
    })),
    // Export for testing
    __mockSearch: mockSearchFn,
    __mockAdvancedSearch: mockAdvancedSearchFn,
  };
});

// Now import the route handlers
import { GET, POST } from '../search/route';

// Get references to the mocked functions
const { __mockSearch, __mockAdvancedSearch } = jest.requireMock('@/lib/search/SearchService');

describe('Search API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search', () => {
    it('应该返回搜索结果 - 基本关键词搜索', async () => {
      // Mock 搜索结果
      __mockSearch.mockResolvedValue({
        success: true,
        data: {
          skills: [
            { id: '1', name: 'Test Skill', slug: 'test-skill' },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
          totalPages: 1,
        },
      });

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.skills).toHaveLength(1);
      expect(__mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'test',
          page: 1,
          pageSize: 20,
          sortBy: 'relevance',
        })
      );
    });

    it('应该支持分类过滤', async () => {
      __mockSearch.mockResolvedValue({
        success: true,
        data: {
          skills: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/search?category=ai'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(__mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ai',
        })
      );
    });

    it('应该支持多条件组合搜索', async () => {
      __mockSearch.mockResolvedValue({
        success: true,
        data: {
          skills: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/search?q=agent&category=ai&language=python&minQuality=80'
      );
      await GET(request);

      expect(mockSearch).toHaveBeenCalledWith({
        query: 'agent',
        category: 'ai',
        language: 'python',
        minQualityScore: 80,
        page: 1,
        pageSize: 20,
        sortBy: 'relevance',
      });
    });

    it('应该支持分页参数', async () => {
      __mockSearch.mockResolvedValue({
        success: true,
        data: {
          skills: [],
          total: 100,
          page: 2,
          pageSize: 10,
          totalPages: 10,
        },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/search?q=test&page=2&pageSize=10'
      );
      await GET(request);

      expect(__mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          pageSize: 10,
        })
      );
    });

    it('应该限制最大pageSize为100', async () => {
      __mockSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 100, totalPages: 0 },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/search?q=test&pageSize=200'
      );
      await GET(request);

      expect(__mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: 100, // 应该被限制为100
        })
      );
    });

    it('应该支持不同的排序方式', async () => {
      __mockSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      });

      const sortOptions = ['relevance', 'quality', 'stars', 'downloads', 'updated'];

      for (const sortBy of sortOptions) {
        const request = new NextRequest(
          `http://localhost:3000/api/search?q=test&sortBy=${sortBy}`
        );
        await GET(request);

        expect(__mockSearch).toHaveBeenCalledWith(
          expect.objectContaining({
            sortBy,
          })
        );
      }
    });

    it('应该在没有任何搜索条件时返回400错误', async () => {
      const request = new NextRequest('http://localhost:3000/api/search');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('至少提供一个搜索条件');
      expect(data.hint).toBeDefined();
    });

    it('应该处理SearchService错误', async () => {
      __mockSearch.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/search?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('搜索失败');
      expect(data.details).toBe('Database connection failed');
    });

    it('应该支持子分类过滤', async () => {
      __mockSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/search?subcategory=llm'
      );
      await GET(request);

      expect(__mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          subcategory: 'llm',
        })
      );
    });

    it('应该支持数据源过滤', async () => {
      __mockSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/search?source=github'
      );
      await GET(request);

      expect(__mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          source: 'github',
        })
      );
    });
  });

  describe('POST /api/search', () => {
    it('应该执行高级搜索', async () => {
      __mockAdvancedSearch.mockResolvedValue({
        success: true,
        data: {
          skills: [],
          total: 0,
          page: 1,
          pageSize: 20,
          totalPages: 0,
        },
      });

      const requestBody = {
        query: 'agent',
        categories: ['ai', 'ml'],
        languages: ['python'],
        minStars: 100,
        minQualityScore: 80,
      };

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(__mockAdvancedSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          query: 'agent',
          categories: ['ai', 'ml'],
          languages: ['python'],
          minStars: 100,
          minQualityScore: 80,
        })
      );
    });

    it('应该支持数据源过滤', async () => {
      __mockAdvancedSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      });

      const requestBody = {
        sources: ['github', 'npm'],
      };

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      await POST(request);

      expect(__mockAdvancedSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          sources: ['github', 'npm'],
        })
      );
    });

    it('应该支持日期范围过滤', async () => {
      __mockAdvancedSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      });

      const requestBody = {
        query: 'test',
        dateRange: {
          from: '2024-01-01',
          to: '2024-12-31',
        },
      };

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      await POST(request);

      expect(__mockAdvancedSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: {
            from: '2024-01-01',
            to: '2024-12-31',
          },
        })
      );
    });

    it('应该在没有搜索条件时返回400错误', async () => {
      const requestBody = {};

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('至少提供一个搜索条件');
    });

    it('应该限制POST请求的pageSize', async () => {
      __mockAdvancedSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 100, totalPages: 0 },
      });

      const requestBody = {
        query: 'test',
        pageSize: 200,
      };

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      await POST(request);

      expect(__mockAdvancedSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: 100, // 应该被限制为100
        })
      );
    });

    it('应该处理高级搜索错误', async () => {
      __mockAdvancedSearch.mockRejectedValue(new Error('Search index corrupted'));

      const requestBody = {
        query: 'test',
      };

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('高级搜索失败');
      expect(data.details).toBe('Search index corrupted');
    });

    it('应该使用默认的分页参数', async () => {
      __mockAdvancedSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      });

      const requestBody = {
        query: 'test',
      };

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      await POST(request);

      expect(__mockAdvancedSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 20,
        })
      );
    });
  });

  describe('参数验证', () => {
    it('GET请求应该正确处理空查询字符串', async () => {
      const request = new NextRequest('http://localhost:3000/api/search?q=');
      const response = await GET(request);

      // 空字符串被视为falsy，应该返回400
      expect(response.status).toBe(400);
    });

    it('GET请求应该接受只有category的情况', async () => {
      __mockSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/search?category=ai'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('POST请求应该接受只有categories数组的情况', async () => {
      __mockAdvancedSearch.mockResolvedValue({
        success: true,
        data: { skills: [], total: 0, page: 1, pageSize: 20, totalPages: 0 },
      });

      const requestBody = {
        categories: ['ai'],
      };

      const request = new NextRequest('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });
});

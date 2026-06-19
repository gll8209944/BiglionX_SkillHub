/**
 * Suggestions API 单元测试
 * 
 * 测试 /api/search/suggestions 端点
 */

import { NextRequest } from 'next/server';

// Mock SearchService

jest.mock('@/lib/search/SearchService', () => {
  const mockFn = jest.fn();
  
  return {
    SearchService: jest.fn().mockImplementation(() => ({
      getSuggestions: mockFn,
    })),
    // Export for testing
    __mockGetSuggestions: mockFn,
  };
});

// Now import the route handler
import { GET } from '../search/suggestions/route';

// Get reference to the mocked function
const { __mockGetSuggestions } = jest.requireMock('@/lib/search/SearchService');

describe('Suggestions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/search/suggestions', () => {
    it('应该返回搜索建议', async () => {
      // Mock 建议结果
      __mockGetSuggestions.mockResolvedValue([
        { text: 'ai agent', count: 150 },
        { text: 'ai chatbot', count: 120 },
        { text: 'ai assistant', count: 95 },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=ai'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toHaveLength(3);
      expect(data.suggestions[0].text).toBe('ai agent');
      expect(__mockGetSuggestions).toHaveBeenCalledWith('ai', 5);
    });

    it('应该支持自定义limit参数', async () => {
      __mockGetSuggestions.mockResolvedValue([
        { text: 'python', count: 200 },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=python&limit=3'
      );
      await GET(request);

      expect(__mockGetSuggestions).toHaveBeenCalledWith('python', 3);
    });

    it('应该限制最大limit为10', async () => {
      __mockGetSuggestions.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=test&limit=20'
      );
      await GET(request);

      expect(__mockGetSuggestions).toHaveBeenCalledWith('test', 10);
    });

    it('应该在查询为空时返回400错误', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('搜索关键词至少需要2个字符');
      expect(data.suggestions).toEqual([]);
    });

    it('应该在查询长度小于2时返回400错误', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=a'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('搜索关键词至少需要2个字符');
    });

    it('应该处理SearchService错误', async () => {
      __mockGetSuggestions.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=test'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('获取建议失败');
      expect(data.details).toBe('Database error');
      expect(data.suggestions).toEqual([]);
    });

    it('应该使用默认limit值5', async () => {
      __mockGetSuggestions.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=test'
      );
      await GET(request);

      expect(__mockGetSuggestions).toHaveBeenCalledWith('test', 5);
    });

    it('应该接受最小长度2的查询', async () => {
      __mockGetSuggestions.mockResolvedValue([
        { text: 'ai', count: 100 },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=ai'
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(__mockGetSuggestions).toHaveBeenCalledWith('ai', 5);
    });

    it('应该返回空数组当没有匹配建议时', async () => {
      __mockGetSuggestions.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=xyz123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toEqual([]);
    });

    it('应该正确处理特殊字符查询', async () => {
      __mockGetSuggestions.mockResolvedValue([
        { text: 'react-native', count: 80 },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=react-'
      );
      await GET(request);

      expect(__mockGetSuggestions).toHaveBeenCalledWith('react-', 5);
    });

    it('应该正确处理中文查询', async () => {
      __mockGetSuggestions.mockResolvedValue([
        { text: '人工智能', count: 150 },
      ]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=人工'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toHaveLength(1);
    });
  });

  describe('边界情况', () => {
    it('应该处理limit为0的情况', async () => {
      __mockGetSuggestions.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=test&limit=0'
      );
      await GET(request);

      // Math.min(0, 10) = 0，应该传递给service
      expect(__mockGetSuggestions).toHaveBeenCalledWith('test', 0);
    });

    it('应该处理limit为负数的情况', async () => {
      __mockGetSuggestions.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=test&limit=-5'
      );
      await GET(request);

      // parseInt('-5') = -5, Math.min(-5, 10) = -5
      expect(__mockGetSuggestions).toHaveBeenCalledWith('test', -5);
    });

    it('应该处理无效的limit参数', async () => {
      __mockGetSuggestions.mockResolvedValue([]);

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=test&limit=abc'
      );
      await GET(request);

      // parseInt('abc') = NaN，但会被传递
      expect(__mockGetSuggestions).toHaveBeenCalled();
    });

    it('应该处理未知错误类型', async () => {
      __mockGetSuggestions.mockRejectedValue('String error');

      const request = new NextRequest(
        'http://localhost:3000/api/search/suggestions?q=test'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('获取建议失败');
      expect(data.details).toBe('Unknown error');
    });
  });
});

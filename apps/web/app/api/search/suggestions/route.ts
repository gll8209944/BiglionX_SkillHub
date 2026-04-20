import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/search/SearchService';

const searchService = new SearchService();

/**
 * GET /api/search/suggestions
 * 
 * 获取搜索建议
 * 
 * Query Parameters:
 * - q: 搜索关键词（必需，至少2个字符）
 * - limit: 返回数量，默认 5，最大 10
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    // 验证参数
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: '搜索关键词至少需要2个字符', suggestions: [] },
        { status: 400 }
      );
    }

    // 获取建议
    const suggestions = await searchService.getSuggestions(query, Math.min(limit, 10));

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Suggestions API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: '获取建议失败', details: errorMessage, suggestions: [] },
      { status: 500 }
    );
  }
}

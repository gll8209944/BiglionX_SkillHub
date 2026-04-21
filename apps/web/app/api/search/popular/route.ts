import { NextResponse } from 'next/server';
import { SearchService } from '@/lib/search/SearchService';

const searchService = new SearchService();

// 标记为动态路由，避免静态生成时的问题
export const dynamic = 'force-dynamic';

/**
 * GET /api/search/popular
 * 
 * 获取热门搜索词
 * 
 * Query Parameters:
 * - limit: 返回数量，默认 10，最大 20
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // 获取热门搜索词
    const popularSearches = await searchService.getPopularSearches(Math.min(limit, 20));

    return NextResponse.json({ popularSearches });
  } catch (error) {
    console.error('Popular searches API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: '获取热门搜索失败', details: errorMessage, popularSearches: [] },
      { status: 500 }
    );
  }
}

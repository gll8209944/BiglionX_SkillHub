import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/search/SearchService';

const searchService = new SearchService();

// 标记为动态路由，避免静态生成时的问题
export const dynamic = 'force-dynamic';

/**
 * GET /api/search
 * 
 * 搜索 Skills
 * 
 * Query Parameters:
 * - q: 搜索关键词（可选）
 * - category: 分类过滤（可选）
 * - subcategory: 子分类过滤（可选）
 * - language: 语言过滤（可选）
 * - minQuality: 最小质量评分（可选）
 * - source: 数据源过滤（可选）
 * - page: 页码，默认 1
 * - pageSize: 每页数量，默认 20
 * - sortBy: 排序方式 (relevance|quality|stars|downloads|updated)，默认 relevance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const subcategory = searchParams.get('subcategory') || undefined;
    const language = searchParams.get('language') || undefined;
    const minQualityScore = searchParams.get('minQuality') 
      ? parseFloat(searchParams.get('minQuality')!) 
      : undefined;
    const source = searchParams.get('source') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100); // 最大100
    const sortBy = (searchParams.get('sortBy') as any) || 'relevance';

    // 验证参数
    if (!query && !category && !subcategory && !language && !source) {
      return NextResponse.json(
        { 
          error: '至少提供一个搜索条件',
          hint: '可以使用 q, category, subcategory, language, 或 source 参数'
        },
        { status: 400 }
      );
    }

    // 执行搜索
    const result = await searchService.search({
      query,
      category,
      subcategory,
      language,
      minQualityScore,
      source,
      page,
      pageSize,
      sortBy,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: '搜索失败', details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search
 * 
 * 高级搜索（支持更复杂的过滤条件）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      query,
      categories,
      languages,
      sources,
      minStars,
      minQualityScore,
      dateRange,
      page = 1,
      pageSize = 20,
    } = body;

    // 验证参数
    if (!query && !categories?.length && !languages?.length && !sources?.length) {
      return NextResponse.json(
        { error: '至少提供一个搜索条件' },
        { status: 400 }
      );
    }

    // 执行高级搜索
    const result = await searchService.advancedSearch({
      query,
      categories,
      languages,
      sources,
      minStars,
      minQualityScore,
      dateRange,
      page,
      pageSize: Math.min(pageSize, 100),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Advanced search API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: '高级搜索失败', details: errorMessage },
      { status: 500 }
    );
  }
}

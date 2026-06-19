import { NextRequest } from 'next/server';
import { semanticSearchService } from '@/lib/search/SemanticSearchService';
import { successResponse, errorResponse } from '@/lib/api-response';

// 标记为动态路由，避免静态生成时的问题
export const dynamic = 'force-dynamic';

/**
 * GET /api/search/semantic
 * 执行语义搜索
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 获取查询参数
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const minSimilarity = parseFloat(searchParams.get('minSimilarity') || '0.3');
    const category = searchParams.get('category') || undefined;
    const language = searchParams.get('language') || undefined;
    const source = searchParams.get('source') || undefined;

    // 验证必填参数
    if (!query) {
      return errorResponse('查询参数 "q" 为必填项', 400);
    }

    if (query.length < 2) {
      return errorResponse('查询词至少需要2个字符', 400);
    }

    console.log(`🔍 收到语义搜索请求: "${query}"`);

    // 执行语义搜索
    const results = await semanticSearchService.search({
      query,
      limit,
      minSimilarity,
      category,
      language,
      source,
    });

    return successResponse({
      results,
      query,
      total: results.length,
      limit,
      minSimilarity,
    });
  } catch (error) {
    console.error('❌ 语义搜索失败:', error);
    return errorResponse('语义搜索失败', 500);
  }
}

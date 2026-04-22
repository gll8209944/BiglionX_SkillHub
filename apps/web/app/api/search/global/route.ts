import { NextRequest, NextResponse } from 'next/server';
import { SearchService, type SearchResult } from '@/lib/search/SearchService';
import { CrawlerService } from '@/lib/services/CrawlerService';

const searchService = new SearchService();
const crawlerService = new CrawlerService();

export const dynamic = 'force-dynamic';

/**
 * GET /api/search/global
 * 
 * 全局搜索：先查本地，再查全网
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json({ error: '查询参数必填' }, { status: 400 });
    }

    // 1. 先执行本地搜索
    const localResult = await searchService.search({
      query,
      page: 1,
      pageSize: 20,
    });

    // 2. 判断是否需要全网搜索（本地结果少于10条时触发）
    const shouldSearchGlobal = localResult.total < 10;
    
    let globalResults: SearchResult = {
      skills: [],
      total: 0,
      page: 1,
      pageSize: 15,
      totalPages: 0,
      query,
    };
    
    if (shouldSearchGlobal) {
      console.log(`🌐 本地结果较少(${localResult.total}条)，触发全网搜索...`);
      
      try {
        // 3. 执行全网搜索（实时爬取GitHub）
        const crawlResult = await crawlerService.searchAndCrawl(query, {
          minStars: 10,
          limit: 15,
        });
        
        console.log(`✅ 全网搜索完成: 发现${crawlResult.discovered}个，成功爬取${crawlResult.crawled}个`);
        
        // 4. 获取刚爬取的skills
        globalResults = await searchService.search({
          query,
          source: 'github',
          page: 1,
          pageSize: 15,
        });
      } catch (error) {
        console.error('❌ 全网搜索失败，使用本地结果:', error);
        // 降级：只返回本地结果
        globalResults = {
          skills: [],
          total: 0,
          page: 1,
          pageSize: 15,
          totalPages: 0,
          query,
        };
      }
    }

    return NextResponse.json({
      local: localResult,
      global: globalResults,
      mode: shouldSearchGlobal ? 'mixed' : 'local',
      query,
    });
  } catch (error) {
    console.error('Global search failed:', error);
    return NextResponse.json(
      { error: '搜索失败', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

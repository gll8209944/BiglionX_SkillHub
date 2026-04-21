import { NextResponse } from 'next/server';
import { getCrawlerConfigService } from '@/lib/services/CrawlerConfigService';
import { CrawlerService } from '@/lib/services/CrawlerService';

/**
 * Vercel Cron Job - GitHub 爬虫任务
 * 通过 vercel.json 配置定时触发
 * 
 * 安全验证：仅允许 Vercel Cron 或携带正确的 Cron Secret 的请求访问
 */
export async function POST(request: Request) {
  try {
    // 安全验证：检查是否为 Vercel Cron 或携带正确的 secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // 如果有配置 CRON_SECRET，则验证请求
    if (cronSecret) {
      const providedSecret = authHeader?.replace('Bearer ', '');
      if (providedSecret !== cronSecret) {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Invalid or missing cron secret' },
          { status: 401 }
        );
      }
    }

    // 加载配置
    const configService = getCrawlerConfigService();
    const config = await configService.getConfig();

    // 检查定时任务是否启用
    if (!config.schedule.enabled) {
      return NextResponse.json({
        success: false,
        message: 'Scheduled crawling is disabled in configuration',
        config: {
          enabled: false,
        },
      });
    }

    // 检查 GitHub 数据源是否启用
    if (!config.dataSources.github.enabled) {
      return NextResponse.json({
        success: false,
        message: 'GitHub data source is disabled',
        config: {
          enabled: true,
          github: false,
        },
      });
    }

    // 执行爬取任务
    const crawlerService = new CrawlerService();
    const searchQueries = config.dataSources.github.searchQueries;
    const minStars = config.dataSources.github.minStars;
    // Vercel 性能优化：限制最大结果数，避免超时
    // Hobby 计划限制 10 秒，Pro 计划限制 60 秒
    const maxResults = Math.min(config.dataSources.github.maxResults || 50, 20); // 最多 20 个结果

    console.log(`🕒 [Cron] Starting GitHub crawl at ${new Date().toISOString()}`);
    console.log(`   Search queries: ${searchQueries.join(', ')}`);
    console.log(`   Min stars: ${minStars}`);
    console.log(`   Max results per query: ${maxResults} (optimized for Vercel)`);

    let totalDiscovered = 0;
    let totalCrawled = 0;
    let totalFailed = 0;
    const results: Array<{ query: string; discovered: number; crawled: number; failed: number }> = [];

    // 性能优化：限制查询数量，避免超时
    // Vercel Hobby 计划限制 10 秒，建议最多 3 个查询
    const optimizedQueries = searchQueries.slice(0, 3);
    
    if (searchQueries.length > 3) {
      console.log(`   ⚠️  Optimized: Only processing first ${optimizedQueries.length} queries to avoid timeout`);
    }

    for (const query of optimizedQueries) {
      try {
        const result = await crawlerService.searchAndCrawl(query, {
          minStars,
          limit: maxResults,
        });

        totalDiscovered += result.discovered;
        totalCrawled += result.crawled;
        totalFailed += result.failed;

        results.push({
          query,
          discovered: result.discovered,
          crawled: result.crawled,
          failed: result.failed,
        });
      } catch (error) {
        console.error(`   ❌ Failed for query "${query}":`, error);
        results.push({
          query,
          discovered: 0,
          crawled: 0,
          failed: 1,
        });
        totalFailed++;
      }
    }

    console.log(`✅ [Cron] GitHub crawl completed:`);
    console.log(`   Total discovered: ${totalDiscovered}`);
    console.log(`   Total crawled: ${totalCrawled}`);
    console.log(`   Total failed: ${totalFailed}`);

    return NextResponse.json({
      success: true,
      message: 'GitHub crawl completed successfully',
      timestamp: new Date().toISOString(),
      summary: {
        totalDiscovered,
        totalCrawled,
        totalFailed,
        queries: results,
      },
      config: {
        enabled: true,
        github: true,
        searchQueries: searchQueries.length,
        minStars,
      },
    });
  } catch (error) {
    console.error('❌ [Cron] GitHub crawl failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Crawl execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 也支持 GET 请求用于手动测试
export async function GET(request: Request) {
  return POST(request);
}

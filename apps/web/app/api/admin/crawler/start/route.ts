import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { CrawlerService } from '@/lib/services/CrawlerService';

/**
 * POST /api/admin/crawler/start
 * 立即启动爬虫任务
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: 检查管理员权限

    const body = await request.json();
    const { mode, config } = body;

    if (!mode || !['immediate', 'full_sync', 'batch'].includes(mode)) {
      return NextResponse.json(
        { error: 'Invalid mode. Must be: immediate, full_sync, or batch' },
        { status: 400 }
      );
    }

    const crawlerService = new CrawlerService();
    let result;

    switch (mode) {
      case 'full_sync':
        // 执行全量同步
        result = await crawlerService.performFullSync();
        break;
      
      case 'batch':
        // 批量爬取（从配置中获取仓库列表）
        if (!config?.repositories || !Array.isArray(config.repositories)) {
          return NextResponse.json(
            { error: 'Repositories array is required for batch mode' },
            { status: 400 }
          );
        }
        result = await crawlerService.crawlBatchAndSave(config.repositories);
        break;
      
      case 'immediate':
      default: {
        // 根据当前配置立即启动爬虫
        const crawlerConfig = await prisma.crawlerConfig.findUnique({
          where: { configKey: 'crawler_settings' },
        });

        if (!crawlerConfig) {
          return NextResponse.json(
            { error: 'Crawler configuration not found' },
            { status: 404 }
          );
        }

        const crawlerData = crawlerConfig.configValue as {
          dataSources?: {
            github?: {
              enabled?: boolean;
              searchQueries?: string[];
              minStars?: number;
              maxResults?: number;
            };
          };
        };
        
        // 从 GitHub 搜索并爬取
        if (crawlerData.dataSources?.github?.enabled) {
          const queries = crawlerData.dataSources.github.searchQueries || [];
          const minStars = crawlerData.dataSources.github.minStars || 30;
          const maxResults = crawlerData.dataSources.github.maxResults || 50;
          
          const searchResults = [];
          for (const query of queries.slice(0, 5)) { // 限制查询数量
            const searchResult = await crawlerService.searchAndCrawl(query, {
              minStars,
              limit: Math.ceil(maxResults / queries.length),
            });
            searchResults.push(searchResult);
          }
          
          result = {
            mode: 'immediate',
            searches: searchResults,
            totalDiscovered: searchResults.reduce((sum, r) => sum + r.discovered, 0),
            totalCrawled: searchResults.reduce((sum, r) => sum + r.crawled, 0),
            totalFailed: searchResults.reduce((sum, r) => sum + r.failed, 0),
          };
        } else {
          return NextResponse.json(
            { error: 'No enabled data sources found' },
            { status: 400 }
          );
        }
        break;
      }
    }

    // 记录审计日志
    await prisma.auditLog.create({
      data: {
        action: 'CRAWLER_STARTED',
        resourceType: 'crawler',
        resourceId: mode,
        actorId: session.user.id,
        metadata: { mode, result },
        status: 'success',
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Failed to start crawler:', error);
    
    // 记录错误日志
    try {
      const session = await auth();
      await prisma.auditLog.create({
        data: {
          action: 'CRAWLER_FAILED',
          resourceType: 'crawler',
          resourceId: 'start',
          actorId: session?.user?.id || null,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          status: 'failed',
        },
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to start crawler', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getCrawlerConfigService } from '@/lib/services/CrawlerConfigService';
import { SkillsImportService } from '@/lib/services/SkillsImportService';

/**
 * Vercel Cron Job - SkillsMP 同步任务
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
        message: 'Scheduled sync is disabled in configuration',
        config: {
          enabled: false,
        },
      });
    }

    // 检查 SkillsMP 数据源是否启用
    if (!config.dataSources.skillsmp.enabled) {
      return NextResponse.json({
        success: false,
        message: 'SkillsMP data source is disabled',
        config: {
          enabled: true,
          skillsmp: false,
        },
      });
    }

    // 执行增量同步
    const skillsImportService = new SkillsImportService();
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24小时前

    console.log(`🕒 [Cron] Starting SkillsMP sync at ${new Date().toISOString()}`);
    console.log(`   Syncing changes since: ${since.toISOString()}`);

    const updatedCount = await skillsImportService.incrementalUpdate(since);

    console.log(`✅ [Cron] SkillsMP sync completed: ${updatedCount} skills updated`);

    return NextResponse.json({
      success: true,
      message: 'SkillsMP sync completed successfully',
      timestamp: new Date().toISOString(),
      summary: {
        updatedCount,
        since: since.toISOString(),
      },
      config: {
        enabled: true,
        skillsmp: true,
      },
    });
  } catch (error) {
    console.error('❌ [Cron] SkillsMP sync failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sync execution failed',
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

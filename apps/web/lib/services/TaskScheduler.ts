import cron, { ScheduledTask } from 'node-cron';
import { SkillsImportService } from './SkillsImportService';
import { CrawlerService } from './CrawlerService';
import { getCrawlerConfigService, type CrawlerConfigData } from './CrawlerConfigService';

/**
 * 定时任务调度器
 * 
 * 配置和管理所有爬虫和同步任务的定时执行
 */
export class TaskScheduler {
  private skillsImportService: SkillsImportService;
  private crawlerService: CrawlerService;
  private configService: ReturnType<typeof getCrawlerConfigService>;
  private scheduledTasks: ScheduledTask[] = [];
  private config: CrawlerConfigData | null = null;

  constructor() {
    this.skillsImportService = new SkillsImportService();
    this.crawlerService = new CrawlerService();
    this.configService = getCrawlerConfigService();
  }

  /**
   * 启动所有定时任务
   */
  async start(): Promise<void> {
    console.log('🕒 Starting task scheduler...');

    // 加载配置
    try {
      this.config = await this.configService.getConfig();
      console.log('✅ Configuration loaded from database');
    } catch (error) {
      console.error('❌ Failed to load configuration, using defaults:', error);
      // 继续使用默认配置
    }

    const scheduleConfig = this.config?.schedule;
    const dataSourceConfig = this.config?.dataSources;

    // 检查定时任务是否启用
    if (scheduleConfig?.enabled) {
      console.log(`✓ Schedule enabled with cron: ${scheduleConfig.cronExpression}`);

      // 1. 如果 GitHub 数据源启用，执行 GitHub 爬虫任务
      if (dataSourceConfig?.github.enabled) {
        this.scheduleGitHubCrawl();
      }

      // 2. 如果 SkillsMP 数据源启用，执行 SkillsMP 同步
      if (dataSourceConfig?.skillsmp.enabled) {
        this.scheduleSkillsMPSync();
      }
    } else {
      console.log('⚠️  Schedule disabled in configuration');
    }

    // 3. 每 6 小时重试失败的爬取任务（始终启用）
    this.scheduleRetryFailedTasks();

    console.log('✅ Task scheduler started');
  }

  /**
   * 停止所有定时任务
   */
  stop(): void {
    console.log('🛑 Stopping task scheduler...');
    
    this.scheduledTasks.forEach(task => task.stop());
    this.scheduledTasks = [];
    
    console.log('✅ Task scheduler stopped');
  }

  /**
   * GitHub 爬虫任务（根据配置的 Cron 表达式）
   */
  private scheduleGitHubCrawl(): void {
    const cronExpression = this.config?.schedule.cronExpression || '0 3 * * *';
    const timezone = this.config?.schedule.timezone || 'Asia/Shanghai';
    const githubConfig = this.config?.dataSources.github;

    const task = cron.schedule(cronExpression, async () => {
      console.log('\n⏰ Running scheduled GitHub crawl...');
      
      try {
        // 使用配置的搜索查询
        const searchQueries = githubConfig?.searchQueries || ['skill.md', 'agent skill', 'ai tool'];
        const minStars = githubConfig?.minStars || 30;
        const maxResults = githubConfig?.maxResults || 50;
        const requireSkillMd = this.config?.filters.requireSkillMd ?? true;
        const excludeArchived = this.config?.filters.excludeArchived ?? true;

        console.log(`   Search queries: ${searchQueries.join(', ')}`);
        console.log(`   Min stars: ${minStars}`);
        console.log(`   Max results: ${maxResults}`);
        console.log(`   Require SKILL.md: ${requireSkillMd}`);
        console.log(`   Exclude archived: ${excludeArchived}`);

        let totalDiscovered = 0;
        let totalCrawled = 0;
        let totalFailed = 0;

        for (const query of searchQueries) {
          const result = await this.crawlerService.searchAndCrawl(query, {
            minStars,
            limit: maxResults,
          });

          totalDiscovered += result.discovered;
          totalCrawled += result.crawled;
          totalFailed += result.failed;
        }

        console.log(`✅ GitHub crawl completed:`);
        console.log(`   Discovered: ${totalDiscovered}`);
        console.log(`   Crawled: ${totalCrawled}`);
        console.log(`   Failed: ${totalFailed}\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ GitHub crawl failed:', errorMessage);
        await this.sendAlert('GitHub Crawl Failed', errorMessage);
      }
    }, {
      timezone,
    });

    this.scheduledTasks.push(task);
    console.log(`✓ Scheduled: GitHub crawl with expression "${cronExpression}" (${timezone})`);
  }

  /**
   * SkillsMP 同步任务（根据配置的 Cron 表达式，每天执行）
   */
  private scheduleSkillsMPSync(): void {
    // SkillsMP 使用固定的每天执行时间（可以后续优化为可配置）
    const cronExpression = '0 4 * * *'; // 凌晨 4 点
    const timezone = this.config?.schedule.timezone || 'Asia/Shanghai';

    const task = cron.schedule(cronExpression, async () => {
      console.log('\n⏰ Running scheduled SkillsMP sync...');
      
      try {
        // 计算上次同步时间（24小时前）
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const updatedCount = await this.skillsImportService.incrementalUpdate(since);
        
        console.log(`✅ SkillsMP sync completed: ${updatedCount} skills updated\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ SkillsMP sync failed:', errorMessage);
        await this.sendAlert('SkillsMP Sync Failed', errorMessage);
      }
    }, {
      timezone,
    });

    this.scheduledTasks.push(task);
    console.log(`✓ Scheduled: SkillsMP sync at 04:00 (${timezone})`);
  }

  /**
   * 重试失败任务
   * 时间：每 6 小时
   */
  private scheduleRetryFailedTasks(): void {
    const task = cron.schedule('0 */6 * * *', async () => {
      console.log('\n⏰ Retrying failed crawler tasks...');
      
      try {
        const retryCount = await this.crawlerService.retryFailedTasks(3);
        
        console.log(`✅ Retry completed: ${retryCount} tasks retried\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Retry failed:', errorMessage);
      }
    }, {
      timezone: 'Asia/Shanghai',
    });

    this.scheduledTasks.push(task);
    console.log('✓ Scheduled: Retry failed tasks every 6 hours');
  }

  /**
   * 更新 trending skills
   * 时间：每小时
   */
  private scheduleTrendingUpdate(): void {
    const task = cron.schedule('0 * * * *', async () => {
      console.log('\n⏰ Updating trending skills...');
      
      try {
        // TODO: 实现 trending skills 更新逻辑
        // 可以从 SkillsMP 获取 trending，或基于本地数据计算
        
        console.log('✅ Trending update completed\n');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Trending update failed:', errorMessage);
      }
    }, {
      timezone: 'Asia/Shanghai',
    });

    this.scheduledTasks.push(task);
    console.log('✓ Scheduled: Update trending skills every hour');
  }

  /**
   * 发送告警通知
   */
  private async sendAlert(title: string, message: string): Promise<void> {
    // TODO: 实现告警通知（邮件、Slack、钉钉等）
    console.error(`\n🚨 ALERT: ${title}`);
    console.error(`Message: ${message}\n`);
    
    // 示例：发送邮件
    // await sendEmail({
    //   to: 'admin@skillhub.io',
    //   subject: `[SkillHub Alert] ${title}`,
    //   text: message,
    // });
  }

  /**
   * 手动触发每日同步（用于测试）
   */
  async triggerDailySync(): Promise<void> {
    console.log('Manually triggering daily sync...');
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const updatedCount = await this.skillsImportService.incrementalUpdate(since);
    console.log(`Manual sync completed: ${updatedCount} skills updated`);
  }

  /**
   * 手动触发每周全量同步（用于测试）
   */
  async triggerWeeklyFullSync(): Promise<void> {
    console.log('Manually triggering weekly full sync...');
    const result = await this.crawlerService.performFullSync();
    console.log(`Manual full sync completed:`, result);
  }

  /**
   * 手动触发失败任务重试（用于测试）
   */
  async triggerRetryFailed(): Promise<void> {
    console.log('Manually triggering retry of failed tasks...');
    const retryCount = await this.crawlerService.retryFailedTasks(3);
    console.log(`Manual retry completed: ${retryCount} tasks retried`);
  }

  /**
   * 获取调度器状态
   */
  getStatus(): {
    activeTasks: number;
    tasks: Array<{ name: string; nextRun?: Date }>;
  } {
    return {
      activeTasks: this.scheduledTasks.length,
      tasks: this.scheduledTasks.map((task, index) => ({
        name: [
          'Daily SkillsMP Sync',
          'Weekly Full Sync',
          'Retry Failed Tasks',
          'Update Trending Skills',
        ][index] || `Task ${index}`,
        // Note: node-cron doesn't expose next run time directly
      })),
    };
  }
}

// 单例实例
let schedulerInstance: TaskScheduler | null = null;

/**
 * 获取调度器单例
 */
export function getScheduler(): TaskScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new TaskScheduler();
  }
  return schedulerInstance;
}

/**
 * 启动调度器（在应用启动时调用）
 */
export async function startScheduler(): Promise<void> {
  const scheduler = getScheduler();
  await scheduler.start();
}

/**
 * 停止调度器（在应用关闭时调用）
 */
export function stopScheduler(): void {
  if (schedulerInstance) {
    schedulerInstance.stop();
    schedulerInstance = null;
  }
}

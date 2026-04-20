import cron, { ScheduledTask } from 'node-cron';
import { SkillsImportService } from './SkillsImportService';
import { CrawlerService } from './CrawlerService';

/**
 * 定时任务调度器
 * 
 * 配置和管理所有爬虫和同步任务的定时执行
 */
export class TaskScheduler {
  private skillsImportService: SkillsImportService;
  private crawlerService: CrawlerService;
  private scheduledTasks: ScheduledTask[] = [];

  constructor() {
    this.skillsImportService = new SkillsImportService();
    this.crawlerService = new CrawlerService();
  }

  /**
   * 启动所有定时任务
   */
  start(): void {
    console.log('🕒 Starting task scheduler...');

    // 1. 每日凌晨 3 点执行 SkillsMP 增量同步
    this.scheduleDailySync();

    // 2. 每周日凌晨 2 点执行 GitHub 全量同步
    this.scheduleWeeklyFullSync();

    // 3. 每 6 小时重试失败的爬取任务
    this.scheduleRetryFailedTasks();

    // 4. 每小时检查 trending skills
    this.scheduleTrendingUpdate();

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
   * 每日增量同步（SkillsMP）
   * 时间：每天凌晨 3:00
   */
  private scheduleDailySync(): void {
    const task = cron.schedule('0 3 * * *', async () => {
      console.log('\n⏰ Running daily SkillsMP sync...');
      
      try {
        // 计算上次同步时间（24小时前）
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const updatedCount = await this.skillsImportService.incrementalUpdate(since);
        
        console.log(`✅ Daily sync completed: ${updatedCount} skills updated\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Daily sync failed:', errorMessage);
        await this.sendAlert('Daily SkillsMP Sync Failed', errorMessage);
      }
    }, {
      timezone: 'Asia/Shanghai',
    });

    this.scheduledTasks.push(task);
    console.log('✓ Scheduled: Daily SkillsMP sync at 03:00');
  }

  /**
   * 每周全量同步（GitHub）
   * 时间：每周日凌晨 2:00
   */
  private scheduleWeeklyFullSync(): void {
    const task = cron.schedule('0 2 * * 0', async () => {
      console.log('\n⏰ Running weekly full sync...');
      
      try {
        const result = await this.crawlerService.performFullSync();
        
        console.log(`✅ Weekly full sync completed:`);
        console.log(`   Total discovered: ${result.total}`);
        console.log(`   Successfully crawled: ${result.success}`);
        console.log(`   Failed: ${result.failed}\n`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Weekly full sync failed:', errorMessage);
        await this.sendAlert('Weekly Full Sync Failed', errorMessage);
      }
    }, {
      timezone: 'Asia/Shanghai',
    });

    this.scheduledTasks.push(task);
    console.log('✓ Scheduled: Weekly GitHub full sync on Sunday at 02:00');
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
export function startScheduler(): void {
  const scheduler = getScheduler();
  scheduler.start();
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

import { prisma } from '@/lib/prisma';
import CrawlerSettingsClient from './CrawlerSettingsClient';

export default async function CrawlerSettingsPage() {
  // 获取爬虫任务统计信息
  const [
    totalTasks,
    pendingTasks,
    processingTasks,
    completedTasks,
    failedTasks,
    recentTasks,
  ] = await Promise.all([
    prisma.crawlerTask.count(),
    prisma.crawlerTask.count({ where: { status: 'pending' } }),
    prisma.crawlerTask.count({ where: { status: 'processing' } }),
    prisma.crawlerTask.count({ where: { status: 'completed' } }),
    prisma.crawlerTask.count({ where: { status: 'failed' } }),
    prisma.crawlerTask.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const stats = {
    totalTasks,
    pendingTasks,
    processingTasks,
    completedTasks,
    failedTasks,
  };

  // 转换 recentTasks 的日期字段为 Date 对象
  const tasksWithDates = recentTasks.map(task => ({
    ...task,
    createdAt: new Date(task.createdAt),
    completedAt: task.completedAt ? new Date(task.completedAt) : null,
  }));

  return <CrawlerSettingsClient stats={stats} recentTasks={tasksWithDates} />;
}

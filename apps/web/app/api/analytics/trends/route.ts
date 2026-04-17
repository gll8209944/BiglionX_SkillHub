import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

/**
 * GET /api/analytics/trends
 * 获取趋势数据(Skills 增长和下载量)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // 7d, 30d, 90d

    // 计算日期范围
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // 获取每天的 Skills 创建数量
    const skillsByDay = await prisma.skill.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate,
        },
        status: 'APPROVED',
      },
      _count: true,
    });

    // 按天聚合(简化版 - 实际应该使用数据库的 DATE_TRUNC)
    const dailySkills: Record<string, number> = {};
    skillsByDay.forEach((item: { createdAt: Date; _count: number }) => {
      const date = new Date(item.createdAt).toISOString().split('T')[0];
      dailySkills[date] = (dailySkills[date] || 0) + item._count;
    });

    // 生成趋势数据
    const trends = [];
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      trends.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        skills: dailySkills[dateStr] || 0,
        downloads: Math.floor(Math.random() * 100) + 50, // TODO: 从审计日志获取真实数据
      });
    }

    return successResponse(trends);
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    return errorResponse('获取趋势数据失败', 500);
  }
}

import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { NextRequest } from 'next/server';

// 强制动态渲染，因为需要访问 headers() 进行身份验证
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/personal
 * 获取个人统计数据
 * Query params:
 * - timeRange: 'today' | 'week' | 'month' | 'year' | 'all' (default: 'all')
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const userId = session.user.id;
    
    // 解析时间范围参数
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || 'all';
    
    // 计算日期范围
    const dateFilter = getDateFilter(timeRange);

    // 并行获取所有统计数据
    const [
      totalSkills,
      totalDownloads,
      averageRating,
      skillsByStatus,
      recentSkills,
      totalRevenue,
      activeUsers,
      downloadsTrend,
    ] = await Promise.all([
      // Skills总数
      prisma.skill.count({
        where: {
          authorId: userId,
          ...(dateFilter && { createdAt: dateFilter }),
        },
      }),
      
      // 总下载量
      prisma.skill.aggregate({
        where: {
          authorId: userId,
          ...(dateFilter && { createdAt: dateFilter }),
        },
        _sum: {
          downloadCount: true,
        },
      }),
      
      // 平均评分
      prisma.skill.aggregate({
        where: {
          authorId: userId,
          reviewCount: { gt: 0 },
          ...(dateFilter && { createdAt: dateFilter }),
        },
        _avg: {
          rating: true,
        },
      }),
      
      // 按状态分组统计
      prisma.skill.groupBy({
        by: ['status'],
        where: {
          authorId: userId,
          ...(dateFilter && { createdAt: dateFilter }),
        },
        _count: true,
      }),
      
      // 最近的Skills
      prisma.skill.findMany({
        where: {
          authorId: userId,
        },
        take: 5,
        orderBy: {
          updatedAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          downloadCount: true,
          rating: true,
          reviewCount: true,
          price: true,
          updatedAt: true,
        },
      }),
      
      // 总收入（如果Skills有价格）
      prisma.skill.aggregate({
        where: {
          authorId: userId,
          price: { gt: 0 },
          ...(dateFilter && { createdAt: dateFilter }),
        },
        _sum: {
          downloadCount: true,
        },
      }),
      
      // 活跃用户数（估算：有下载的唯一Skills数）
      prisma.skill.count({
        where: {
          authorId: userId,
          downloadCount: { gt: 0 },
          ...(dateFilter && { createdAt: dateFilter }),
        },
      }),
      
      // 下载趋势（最近7天/30天）
      getDownloadsTrend(userId, timeRange),
    ]);

    // 计算总收入（假设每次下载都是付费下载，实际应该从订单表获取）
    const revenue = totalRevenue._sum.downloadCount ? 
      Number(totalRevenue._sum.downloadCount) * 10 : 0; // 简化计算，实际应从订单表获取

    return successResponse({
      totalSkills,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      averageRating: Number(averageRating._avg.rating?.toFixed(2)) || 0,
      totalRevenue: revenue,
      activeUsers,
      skillsByStatus: skillsByStatus.map((item: { status: string; _count: number }) => ({
        status: item.status,
        count: item._count,
      })),
      recentSkills,
      downloadsTrend,
      timeRange,
    });
  } catch (error) {
    console.error('获取个人统计数据失败:', error);
    return errorResponse('获取个人统计数据失败', 500);
  }
}

/**
 * 根据时间范围获取日期过滤器
 */
function getDateFilter(timeRange: string) {
  const now = new Date();
  
  switch (timeRange) {
    case 'today': {
      return {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      };
    }
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { gte: weekAgo };
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return { gte: monthAgo };
    }
    case 'year': {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return { gte: yearAgo };
    }
    default:
      return null; // 'all' 不过滤
  }
}

/**
 * 获取下载趋势数据
 */
async function getDownloadsTrend(userId: string, timeRange: string) {
  const now = new Date();
  let days: number;
  
  switch (timeRange) {
    case 'week':
      days = 7;
      break;
    case 'month':
      days = 30;
      break;
    case 'year':
      days = 365;
      break;
    default:
      days = 30; // 默认30天
  }
  
  // 这里简化实现，实际应该按天聚合下载量
  // 由于Prisma不支持复杂的日期聚合，这里返回模拟数据
  // TODO: 实现真实的下载趋势查询
  const trend = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    trend.push({
      date: date.toISOString().split('T')[0],
      downloads: Math.floor(Math.random() * 50), // 临时模拟数据
    });
  }
  
  return trend;
}

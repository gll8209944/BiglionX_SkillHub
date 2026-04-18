import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-config';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

// 强制动态渲染，因为需要访问 headers() 进行身份验证
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/overview
 * 获取数据分析概览
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

    // 获取统计数据
    const [
      totalSkills,
      totalDownloads,
      totalUsers,
      averageRating,
      skillsByCategory,
      recentDownloads,
    ] = await Promise.all([
      prisma.skill.count({
        where: {
          status: 'APPROVED',
        },
      }),
      prisma.skill.aggregate({
        _sum: {
          downloadCount: true,
        },
      }),
      prisma.user.count(),
      prisma.skill.aggregate({
        _avg: {
          rating: true,
        },
        where: {
          reviewCount: {
            gt: 0,
          },
        },
      }),
      prisma.skill.groupBy({
        by: ['category'],
        _count: true,
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
      }),
      prisma.skill.findMany({
        take: 10,
        orderBy: {
          downloadCount: 'desc',
        },
        select: {
          id: true,
          name: true,
          slug: true,
          downloadCount: true,
          category: true,
        },
      }),
    ]);

    // 计算本周增长(简化版)
    const lastWeekSkills = await prisma.skill.count({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const weeklyGrowth = totalSkills > 0 
      ? Math.round((lastWeekSkills / totalSkills) * 100)
      : 0;

    // 活跃用户(最近7天有活动的用户)
    const activeUsers = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      distinct: ['actorId'],
    });

    return successResponse({
      totalSkills,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      totalUsers,
      averageRating: averageRating._avg.rating || 0,
      weeklyGrowth,
      activeUsers: activeUsers.length,
      skillsByCategory: skillsByCategory.map((item: { category: string | null; _count: number }) => ({
        category: item.category,
        count: item._count,
      })),
      topSkills: recentDownloads,
      period,
    });
  } catch (error) {
    console.error('获取分析数据失败:', error);
    return errorResponse('获取分析数据失败', 500);
  }
}

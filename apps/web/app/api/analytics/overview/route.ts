import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // 计算时间范围
    const now = new Date();
    let startDate = new Date();
    
    if (period === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(now.getDate() - 90);
    }

    // 获取总 Skills 数
    const totalSkills = await prisma.skill.count({
      where: {
        status: 'APPROVED',
        isPublic: true,
      },
    });

    // 获取总下载量（从所有 Skills 的 downloadCount 求和）
    const skills = await prisma.skill.findMany({
      select: {
        downloadCount: true,
      },
    });
    const totalDownloads = skills.reduce((sum, skill) => sum + skill.downloadCount, 0);

    // 获取总用户数
    const totalUsers = await prisma.user.count();

    // 获取活跃用户数（最近 30 天有活动的用户）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // 获取平均评分（从 Skills 的 rating 字段计算）
    const skillsWithRating = await prisma.skill.findMany({
      where: {
        reviewCount: {
          gt: 0,
        },
      },
      select: {
        rating: true,
      },
    });
    const averageRating = skillsWithRating.length > 0
      ? skillsWithRating.reduce((sum, s) => sum + s.rating, 0) / skillsWithRating.length
      : 0;

    // 计算本周增长率
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const skillsThisWeek = await prisma.skill.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });
    const previousWeek = new Date(sevenDaysAgo);
    previousWeek.setDate(previousWeek.getDate() - 7);
    const skillsPreviousWeek = await prisma.skill.count({
      where: {
        createdAt: {
          gte: previousWeek,
          lt: sevenDaysAgo,
        },
      },
    });
    const weeklyGrowth = skillsPreviousWeek > 0
      ? Math.round(((skillsThisWeek - skillsPreviousWeek) / skillsPreviousWeek) * 100)
      : 0;

    // 获取分类分布
    const skillsByCategory = await prisma.skill.groupBy({
      by: ['category'],
      _count: true,
      where: {
        status: 'APPROVED',
        isPublic: true,
      },
    });

    // 获取热门 Skills（按下载量排序）
    const topSkills = await prisma.skill.findMany({
      where: {
        status: 'APPROVED',
        isPublic: true,
      },
      orderBy: {
        downloadCount: 'desc',
      },
      take: 10,
      select: {
        id: true,
        name: true,
        category: true,
        downloadCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalSkills,
        totalDownloads,
        totalUsers,
        activeUsers,
        averageRating: parseFloat(averageRating.toFixed(1)),
        weeklyGrowth,
        skillsByCategory: skillsByCategory.map(s => ({
          category: s.category,
          count: s._count,
        })),
        topSkills,
      },
    });
  } catch (error) {
    console.error('获取平台分析数据失败:', error);
    return NextResponse.json(
      { error: '获取分析数据失败' },
      { status: 500 }
    );
  }
}

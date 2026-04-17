import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

/**
 * GET /api/analytics/personal
 * 获取个人统计数据
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const userId = session.user.id;

    // 获取用户的 Skills 统计
    const [
      totalSkills,
      totalDownloads,
      averageRating,
      skillsByStatus,
      recentSkills,
    ] = await Promise.all([
      prisma.skill.count({
        where: {
          authorId: userId,
        },
      }),
      prisma.skill.aggregate({
        where: {
          authorId: userId,
        },
        _sum: {
          downloadCount: true,
        },
      }),
      prisma.skill.aggregate({
        where: {
          authorId: userId,
          reviewCount: { gt: 0 },
        },
        _avg: {
          rating: true,
        },
      }),
      prisma.skill.groupBy({
        by: ['status'],
        where: {
          authorId: userId,
        },
        _count: true,
      }),
      prisma.skill.findMany({
        where: {
          authorId: userId,
        },
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          downloadCount: true,
          rating: true,
          createdAt: true,
        },
      }),
    ]);

    return successResponse({
      totalSkills,
      totalDownloads: totalDownloads._sum.downloadCount || 0,
      averageRating: averageRating._avg.rating || 0,
      skillsByStatus: skillsByStatus.map((item: { status: string; _count: number }) => ({
        status: item.status,
        count: item._count,
      })),
      recentSkills,
    });
  } catch (error) {
    console.error('获取个人统计数据失败:', error);
    return errorResponse('获取个人统计数据失败', 500);
  }
}

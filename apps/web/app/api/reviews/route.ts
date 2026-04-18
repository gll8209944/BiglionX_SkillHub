import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';

// 强制动态渲染，因为需要访问 headers() 进行身份验证
export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews
 * 获取审核列表（管理员或命名空间所有者）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const namespaceId = searchParams.get('namespaceId');

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    // 权限检查：只有管理员或命名空间所有者可以查看审核
    // 这里简化处理，实际应根据用户角色过滤
    if (namespaceId) {
      where.skill = {
        namespaceId,
      };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          skill: {
            select: {
              id: true,
              name: true,
              slug: true,
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    return successResponse({
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取审核列表失败:', error);
    return errorResponse('获取审核列表失败', 500);
  }
}

/**
 * POST /api/reviews
 * 创建审核记录（通常在技能提交时自动创建）
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { skillId, version } = body;

    if (!skillId || !version) {
      return errorResponse('技能ID和版本为必填项', 400);
    }

    // 检查技能是否存在
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return notFoundResponse('技能不存在');
    }

    // 检查是否已有待审核的记录
    const existingReview = await prisma.review.findFirst({
      where: {
        skillId,
        status: {
          in: ['PENDING_REVIEW', 'UNDER_REVIEW'],
        },
      },
    });

    if (existingReview) {
      return errorResponse('该技能已有待审核的记录', 400);
    }

    // 创建审核记录
    const review = await prisma.review.create({
      data: {
        skillId,
        version,
        status: 'PENDING_REVIEW',
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // 更新技能状态
    await prisma.skill.update({
      where: { id: skillId },
      data: {
        status: 'PENDING_REVIEW',
      },
    });

    return successResponse(review, 201);
  } catch (error) {
    console.error('创建审核记录失败:', error);
    return errorResponse('创建审核记录失败', 500);
  }
}

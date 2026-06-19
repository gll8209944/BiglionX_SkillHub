import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-config';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/reviews/[id]
 * 更新审核状态（批准或拒绝）
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();
    const { status, reviewNotes, rejectionReason } = body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return errorResponse('无效的状态', 400);
    }

    // 查找审核记录
    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        skill: true,
      },
    });

    if (!review) {
      return notFoundResponse('审核记录不存在');
    }

    // 更新审核记录
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        status,
        reviewerId: session.user.id,
        reviewNotes: reviewNotes || null,
        rejectionReason: rejectionReason || null,
        completedAt: new Date(),
      },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
            slug: true,
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
    });

    // 更新技能状态
    await prisma.skill.update({
      where: { id: review.skillId },
      data: {
        status: status === 'APPROVED' ? 'APPROVED' : 'REJECTED',
      },
    });

    return successResponse(updatedReview);
  } catch (error) {
    console.error('更新审核状态失败:', error);
    return errorResponse('更新审核状态失败', 500);
  }
}

/**
 * DELETE /api/reviews/[id]
 * 删除审核记录（仅管理员）
 */
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // 查找审核记录
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return notFoundResponse('审核记录不存在');
    }

    // TODO: 添加管理员权限检查
    // if (session.user.role !== 'ADMIN') {
    //   return forbiddenResponse('只有管理员可以删除审核记录');
    // }

    // 删除审核记录
    await prisma.review.delete({
      where: { id },
    });

    return successResponse({ message: '审核记录已删除' });
  } catch (error) {
    console.error('删除审核记录失败:', error);
    return errorResponse('删除审核记录失败', 500);
  }
}

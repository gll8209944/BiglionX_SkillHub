import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-config';

interface SessionUser {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

/**
 * PATCH /api/admin/feedback/[id]
 * 审核用户反馈（接受或拒绝）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // 检查管理员权限
    const session = await auth();
    if (!session || (session.user as SessionUser)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "accepted" or "rejected"' },
        { status: 400 }
      );
    }

    // 查找反馈
    const feedback = await prisma.skillFeedback.findUnique({
      where: { id },
      include: {
        skill: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // 更新反馈状态
    const updatedFeedback = await prisma.skillFeedback.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || null,
      },
    });

    // 如果接受了反馈，更新skill的分类
    if (status === 'accepted') {
      const updateData: Record<string, string> = {};
      
      if (feedback.suggestedCategory) {
        updateData.category = feedback.suggestedCategory;
      }
      
      if (feedback.suggestedSubcategory) {
        updateData.subcategory = feedback.suggestedSubcategory;
      }

      if (Object.keys(updateData).length > 0) {
        await prisma.skill.update({
          where: { id: feedback.skillId },
          data: updateData,
        });
      }
    }

    return NextResponse.json({
      success: true,
      feedback: updatedFeedback,
      message: status === 'accepted' ? '反馈已接受，分类已更新' : '反馈已拒绝',
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/feedback
 * 获取所有待审核的反馈（管理员）
 */
export async function GET(request: NextRequest) {
  try {
    // 检查管理员权限
    const session = await auth();
    if (!session || (session.user as SessionUser)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
      prisma.skillFeedback.findMany({
        where: { status },
        include: {
          skill: {
            select: {
              id: true,
              name: true,
              slug: true,
              category: true,
              subcategory: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.skillFeedback.count({
        where: { status },
      }),
    ]);

    return NextResponse.json({
      feedbacks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedbacks' },
      { status: 500 }
    );
  }
}

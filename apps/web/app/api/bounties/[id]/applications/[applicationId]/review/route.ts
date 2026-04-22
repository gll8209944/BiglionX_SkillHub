import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/bounties/[id]/applications/[applicationId]/review - 审核申请
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    const { id, applicationId } = await params;
    const body = await request.json();
    const { action, reviewNote } = body; // action: 'accept' | 'reject'

    // 检查悬赏是否存在
    const bounty = await prisma.skillBounty.findUnique({
      where: { id },
    });

    if (!bounty) {
      return NextResponse.json(
        { success: false, error: '悬赏不存在' },
        { status: 404 }
      );
    }

    // 只有悬赏创建者可以审核
    if (bounty.creatorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '无权限操作' },
        { status: 403 }
      );
    }

    // 检查申请是否存在
    const application = await prisma.bountyApplication.findUnique({
      where: { id: applicationId },
      include: {
        user: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: '申请不存在' },
        { status: 404 }
      );
    }

    if (application.bountyId !== id) {
      return NextResponse.json(
        { success: false, error: '申请不属于此悬赏' },
        { status: 400 }
      );
    }

    // 更新申请状态
    const newStatus = action === 'accept' ? 'ACCEPTED' : 'REJECTED';
    
    await prisma.bountyApplication.update({
      where: { id: applicationId },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewNote,
      },
    });

    // 如果接受申请，更新悬赏状态并通知其他申请者
    if (action === 'accept') {
      await prisma.skillBounty.update({
        where: { id },
        data: {
          assigneeId: application.userId,
          status: 'ASSIGNED',
        },
      });

      // 拒绝其他待处理的申请
      await prisma.bountyApplication.updateMany({
        where: {
          bountyId: id,
          id: { not: applicationId },
          status: 'PENDING',
        },
        data: {
          status: 'REJECTED',
          reviewNote: '悬赏已分配给其他开发者',
        },
      });

      // 通知承接者
      await prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'SYSTEM',
          title: '悬赏申请已通过',
          message: `您申请的悬赏「${bounty.title}」已被接受，请开始开发`,
          link: `/bounties/${id}`,
          metadata: {
            bountyId: id,
            applicationId: application.id,
          },
        },
      });
    } else {
      // 通知申请者被拒绝
      await prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'SYSTEM',
          title: '悬赏申请未通过',
          message: `您申请的悬赏「${bounty.title}」未被接受`,
          link: `/bounties/${id}`,
          metadata: {
            bountyId: id,
            applicationId: application.id,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: action === 'accept' ? '已接受申请' : '已拒绝申请',
    });
  } catch (error) {
    console.error('Error reviewing application:', error);
    return NextResponse.json(
      { success: false, error: '审核申请失败' },
      { status: 500 }
    );
  }
}

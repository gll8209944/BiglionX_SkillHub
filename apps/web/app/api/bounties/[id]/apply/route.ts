import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// 验证申请的请求体
const applySchema = z.object({
  proposal: z.string().min(50),
  estimatedTime: z.string().optional(),
  portfolio: z.string().optional(),
});

/**
 * POST /api/bounties/[id]/apply - 申请悬赏
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const validatedData = applySchema.parse(body);

    // 检查悬赏是否存在且开放
    const bounty = await prisma.skillBounty.findUnique({
      where: { id },
      include: {
        creator: true,
      },
    });

    if (!bounty) {
      return NextResponse.json(
        { success: false, error: '悬赏不存在' },
        { status: 404 }
      );
    }

    if (bounty.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: '此悬赏不再接受申请' },
        { status: 400 }
      );
    }

    // 不能申请自己发布的悬赏
    if (bounty.creatorId === user.id) {
      return NextResponse.json(
        { success: false, error: '不能申请自己发布的悬赏' },
        { status: 400 }
      );
    }

    // 检查是否已经申请过
    const existingApplication = await prisma.bountyApplication.findUnique({
      where: {
        bountyId_userId: {
          bountyId: id,
          userId: user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: '您已经申请过此悬赏' },
        { status: 400 }
      );
    }

    // 创建申请
    const application = await prisma.bountyApplication.create({
      data: {
        bountyId: id,
        userId: user.id,
        proposal: validatedData.proposal,
        estimatedTime: validatedData.estimatedTime,
        portfolio: validatedData.portfolio,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // 发送通知给悬赏发布者
    await prisma.notification.create({
      data: {
        userId: bounty.creatorId,
        type: 'SYSTEM',
        title: '收到新的悬赏申请',
        message: `${user.name || user.email} 申请了您的悬赏「${bounty.title}」`,
        link: `/bounties/${id}`,
        metadata: {
          bountyId: id,
          applicationId: application.id,
          applicantId: user.id,
        },
      },
    });

    return NextResponse.json(
      { success: true, data: application },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const flattened = error.flatten();
      return NextResponse.json(
        { success: false, error: '验证失败', details: flattened.fieldErrors },
        { status: 400 }
      );
    }
    
    console.error('Error applying for bounty:', error);
    return NextResponse.json(
      { success: false, error: '申请悬赏失败' },
      { status: 500 }
    );
  }
}

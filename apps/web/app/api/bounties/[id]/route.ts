import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/bounties/[id] - 获取悬赏详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const bounty = await prisma.skillBounty.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        skill: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        applications: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
        submissions: {
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
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!bounty) {
      return NextResponse.json(
        { success: false, error: '悬赏不存在' },
        { status: 404 }
      );
    }

    // 解析 requirements JSON
    const parsedBounty = {
      ...bounty,
      requirements: JSON.parse(bounty.requirements),
    };

    return NextResponse.json({
      success: true,
      data: parsedBounty,
    });
  } catch (error) {
    console.error('Error fetching bounty:', error);
    return NextResponse.json(
      { success: false, error: '获取悬赏详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bounties/[id] - 更新悬赏
 */
export async function PUT(
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

    const bounty = await prisma.skillBounty.findUnique({
      where: { id },
    });

    if (!bounty) {
      return NextResponse.json(
        { success: false, error: '悬赏不存在' },
        { status: 404 }
      );
    }

    // 只有创建者可以更新
    if (bounty.creatorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '无权限操作' },
        { status: 403 }
      );
    }

    const updatedBounty = await prisma.skillBounty.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        requirements: body.requirements ? JSON.stringify(body.requirements) : undefined,
        reward: body.reward,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        status: body.status,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedBounty,
    });
  } catch (error) {
    console.error('Error updating bounty:', error);
    return NextResponse.json(
      { success: false, error: '更新悬赏失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bounties/[id] - 删除/取消悬赏
 */
export async function DELETE(
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

    const bounty = await prisma.skillBounty.findUnique({
      where: { id },
    });

    if (!bounty) {
      return NextResponse.json(
        { success: false, error: '悬赏不存在' },
        { status: 404 }
      );
    }

    // 只有创建者或管理员可以删除
    if (bounty.creatorId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '无权限操作' },
        { status: 403 }
      );
    }

    // 如果已经有承接者，不允许直接删除
    if (bounty.assigneeId && bounty.status !== 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: '已有开发者承接此悬赏，无法删除' },
        { status: 400 }
      );
    }

    await prisma.skillBounty.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({
      success: true,
      message: '悬赏已取消',
    });
  } catch (error) {
    console.error('Error deleting bounty:', error);
    return NextResponse.json(
      { success: false, error: '取消悬赏失败' },
      { status: 500 }
    );
  }
}

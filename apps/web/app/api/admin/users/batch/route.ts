import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/users/batch
 * 批量操作用户
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // 检查管理员权限
    if (!session?.user) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      );
    }

    // TODO: 添加管理员角色检查
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userIds, action } = body;

    // 验证参数
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: '请提供用户 ID 列表' },
        { status: 400 }
      );
    }

    if (!action || !['disable', 'enable', 'verify_email', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: '无效的操作类型' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as string[],
      failed: [] as Array<{ userId: string; reason: string }>,
    };

    // 批量处理
    for (const userId of userIds) {
      try {
        // 验证用户是否存在
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            _count: {
              select: {
                skills: true,
              },
            },
          },
        });

        if (!user) {
          results.failed.push({
            userId,
            reason: '用户不存在',
          });
          continue;
        }

        switch (action) {
          case 'disable':
            await prisma.user.update({
              where: { id: userId },
              data: { isDisabled: true },
            });

            await prisma.auditLog.create({
              data: {
                action: 'USER_DISABLED',
                resourceType: 'User',
                resourceId: userId,
                actorId: session.user.id || undefined,
                metadata: {
                  userEmail: user.email,
                  userName: user.name,
                  batchOperation: true,
                },
              },
            });

            results.success.push(userId);
            break;

          case 'enable':
            await prisma.user.update({
              where: { id: userId },
              data: { isDisabled: false },
            });

            await prisma.auditLog.create({
              data: {
                action: 'USER_ENABLED',
                resourceType: 'User',
                resourceId: userId,
                actorId: session.user.id || undefined,
                metadata: {
                  userEmail: user.email,
                  userName: user.name,
                  batchOperation: true,
                },
              },
            });

            results.success.push(userId);
            break;

          case 'verify_email':
            await prisma.user.update({
              where: { id: userId },
              data: { emailVerified: new Date() },
            });

            await prisma.auditLog.create({
              data: {
                action: 'USER_EMAIL_VERIFIED',
                resourceType: 'User',
                resourceId: userId,
                actorId: session.user.id || undefined,
                metadata: {
                  userEmail: user.email,
                  userName: user.name,
                  batchOperation: true,
                },
              },
            });

            results.success.push(userId);
            break;

          case 'delete':
            // 检查是否有关联的 Skills
            if (user._count.skills > 0) {
              results.failed.push({
                userId,
                reason: `该用户有 ${user._count.skills} 个 Skills，无法删除`,
              });
              continue;
            }

            await prisma.user.delete({
              where: { id: userId },
            });

            await prisma.auditLog.create({
              data: {
                action: 'USER_DELETED',
                resourceType: 'User',
                resourceId: userId,
                actorId: session.user.id || undefined,
                metadata: {
                  userEmail: user.email,
                  userName: user.name,
                  batchOperation: true,
                },
              },
            });

            results.success.push(userId);
            break;
        }
      } catch (error) {
        console.error(`处理用户 ${userId} 失败:`, error);
        results.failed.push({
          userId,
          reason: error instanceof Error ? error.message : '未知错误',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `批量操作完成：成功 ${results.success.length} 个，失败 ${results.failed.length} 个`,
      results,
    });
  } catch (error) {
    console.error('批量操作失败:', error);
    return NextResponse.json(
      { error: '批量操作失败，请重试' },
      { status: 500 }
    );
  }
}

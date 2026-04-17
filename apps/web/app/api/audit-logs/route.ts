import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

/**
 * GET /api/audit-logs
 * 获取审计日志列表（仅管理员）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action');
    const resourceType = searchParams.get('resourceType');

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: {
      action?: string;
      resourceType?: string;
    } = {};

    if (action) {
      where.action = action;
    }

    if (resourceType) {
      where.resourceType = resourceType;
    }

    // TODO: 添加管理员权限检查
    // if (session.user.role !== 'ADMIN') {
    //   return forbiddenResponse('只有管理员可以查看审计日志');
    // }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取审计日志失败:', error);
    return errorResponse('获取审计日志失败', 500);
  }
}

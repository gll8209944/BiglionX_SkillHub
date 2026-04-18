import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-config';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';

/**
 * GET /api/namespaces
 * 获取命名空间列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const session = await auth();

    // 如果未登录，只返回全局命名空间
    if (!session) {
      where.type = 'GLOBAL';
    }

    const total = await prisma.namespace.count({ where });

    const namespaces = await prisma.namespace.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            skills: true,
            members: true,
          },
        },
      },
    });

    return successResponse({
      namespaces,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取命名空间列表失败:', error);
    return errorResponse('获取命名空间列表失败', 500);
  }
}

/**
 * POST /api/namespaces
 * 创建命名空间
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { name, slug, description, type } = body;

    // 验证必填字段
    if (!name || !slug || !type) {
      return errorResponse('名称、Slug 和类型为必填项', 400);
    }

    // 验证类型
    if (!['PERSONAL', 'TEAM', 'GLOBAL'].includes(type)) {
      return errorResponse('无效的命名空间类型', 400);
    }

    // 检查 slug 是否已存在
    const existingNamespace = await prisma.namespace.findUnique({
      where: { slug },
    });

    if (existingNamespace) {
      return errorResponse('Slug 已存在', 400);
    }

    // GLOBAL 类型需要管理员权限（暂时不允许创建）
    if (type === 'GLOBAL') {
      return errorResponse('无法创建全局命名空间', 403);
    }

    // 创建命名空间
    const namespace = await prisma.namespace.create({
      data: {
        name,
        slug,
        description: description || '',
        type,
        ownerId: session.user.id!,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // 自动添加创建者为成员
    await prisma.namespaceMember.create({
      data: {
        namespaceId: namespace.id,
        userId: session.user.id!,
        role: 'OWNER',
      },
    });

    return successResponse(namespace, 201);
  } catch (error) {
    console.error('创建命名空间失败:', error);
    return errorResponse('创建命名空间失败', 500);
  }
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from '@/lib/api-response';

/**
 * GET /api/skills
 * 获取技能列表（支持分页、搜索、过滤）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 查询参数
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const namespaceId = searchParams.get('namespaceId');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 计算偏移量
    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: any = {};

    // 搜索条件
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 状态过滤
    if (status) {
      where.status = status;
    }

    // 命名空间过滤
    if (namespaceId) {
      where.namespaceId = namespaceId;
    }

    // 只返回已批准的技能（除非用户是管理员或所有者）
    const session = await auth();
    if (!session) {
      where.status = 'APPROVED';
    }

    // 查询总数
    const total = await prisma.skill.count({ where });

    // 查询数据
    const skills = await prisma.skill.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        namespace: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        _count: {
          select: {
            versions: true,
            downloads: true,
          },
        },
      },
    });

    return successResponse({
      skills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('获取技能列表失败:', error);
    return errorResponse('获取技能列表失败', 500);
  }
}

/**
 * POST /api/skills
 * 创建新技能
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { name, slug, description, repositoryUrl, category, tags, namespaceId } = body;

    // 验证必填字段
    if (!name || !slug) {
      return errorResponse('名称和 Slug 为必填项', 400);
    }

    // 检查 slug 是否已存在
    const existingSkill = await prisma.skill.findUnique({
      where: { slug },
    });

    if (existingSkill) {
      return errorResponse('Slug 已存在', 400);
    }

    // 如果指定了命名空间，检查权限
    if (namespaceId) {
      const namespace = await prisma.namespace.findUnique({
        where: { id: namespaceId },
        include: { members: true },
      });

      if (!namespace) {
        return notFoundResponse('命名空间不存在');
      }

      // 检查用户是否是命名空间成员或所有者
      const isMember = namespace.members.some(
        (member: any) => member.userId === session.user!.id
      );
      const isOwner = namespace.ownerId === session.user!.id;

      if (!isMember && !isOwner) {
        return errorResponse('没有权限在此命名空间中创建技能', 403);
      }
    }

    // 创建技能
    const skill = await prisma.skill.create({
      data: {
        name,
        slug,
        description: description || '',
        repositoryUrl: repositoryUrl || '',
        category: category || 'other',
        tags: tags || [],
        authorId: session.user.id,
        namespaceId: namespaceId || null,
        status: 'DRAFT',
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        namespace: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    return successResponse(skill, 201);
  } catch (error) {
    console.error('创建技能失败:', error);
    return errorResponse('创建技能失败', 500);
  }
}

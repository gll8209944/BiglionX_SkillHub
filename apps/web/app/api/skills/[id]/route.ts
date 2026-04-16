import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse } from '@/lib/api-response';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/skills/[id]
 * 获取单个技能详情
 */
export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = await params;

    const skill = await prisma.skill.findUnique({
      where: { id },
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
        versions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
        _count: {
          select: {
            versions: true,
            downloads: true,
            reviews: true,
          },
        },
      },
    });

    if (!skill) {
      return notFoundResponse('技能不存在');
    }

    return successResponse(skill);
  } catch (error) {
    console.error('获取技能详情失败:', error);
    return errorResponse('获取技能详情失败', 500);
  }
}

/**
 * PUT /api/skills/[id]
 * 更新技能
 */
export async function PUT(request: NextRequest, { params }: Props) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;
    const body = await request.json();

    // 查找技能
    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return notFoundResponse('技能不存在');
    }

    // 检查权限（只有作者或管理员可以更新）
    if (skill.authorId !== session.user.id) {
      // TODO: 添加管理员检查
      return forbiddenResponse('没有权限更新此技能');
    }

    // 如果更新 slug，检查是否已存在
    if (body.slug && body.slug !== skill.slug) {
      const existingSkill = await prisma.skill.findUnique({
        where: { slug: body.slug },
      });

      if (existingSkill) {
        return errorResponse('Slug 已存在', 400);
      }
    }

    // 更新技能
    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        repositoryUrl: body.repositoryUrl,
        category: body.category,
        tags: body.tags,
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

    return successResponse(updatedSkill);
  } catch (error) {
    console.error('更新技能失败:', error);
    return errorResponse('更新技能失败', 500);
  }
}

/**
 * DELETE /api/skills/[id]
 * 删除技能
 */
export async function DELETE(request: NextRequest, { params }: Props) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const { id } = await params;

    // 查找技能
    const skill = await prisma.skill.findUnique({
      where: { id },
    });

    if (!skill) {
      return notFoundResponse('技能不存在');
    }

    // 检查权限（只有作者或管理员可以删除）
    if (skill.authorId !== session.user.id) {
      // TODO: 添加管理员检查
      return forbiddenResponse('没有权限删除此技能');
    }

    // 软删除（归档）
    await prisma.skill.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
      },
    });

    return successResponse({ message: '技能已归档' });
  } catch (error) {
    console.error('删除技能失败:', error);
    return errorResponse('删除技能失败', 500);
  }
}

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import crypto from 'crypto';

// 强制动态渲染，因为需要访问 headers() 进行身份验证
export const dynamic = 'force-dynamic';

/**
 * GET /api/settings/api-keys
 * 获取用户的 API 密钥列表
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        permissions: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return successResponse(apiKeys);
  } catch (error) {
    console.error('获取 API 密钥失败:', error);
    return errorResponse('获取 API 密钥失败', 500);
  }
}

/**
 * POST /api/settings/api-keys
 * 创建新的 API 密钥
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { name, permissions, expiresIn } = body;

    // 验证输入
    if (!name || !name.trim()) {
      return errorResponse('密钥名称为必填项', 400);
    }

    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return errorResponse('至少选择一个权限', 400);
    }

    // 生成 API 密钥
    const rawKey = `sk_live_${crypto.randomBytes(32).toString('hex')}`;
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const prefix = `${rawKey.substring(0, 12)}...`;

    // 计算过期时间
    let expiresAt: Date | null = null;
    if (expiresIn) {
      const now = new Date();
      switch (expiresIn) {
        case '7d':
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // 保存到数据库
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        keyHash,
        prefix,
        permissions,
        expiresAt,
      },
    });

    // 返回完整密钥(仅显示一次)
    return successResponse({
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      fullKey: rawKey, // 重要: 仅在创建时返回完整密钥
    });
  } catch (error) {
    console.error('创建 API 密钥失败:', error);
    return errorResponse('创建 API 密钥失败', 500);
  }
}

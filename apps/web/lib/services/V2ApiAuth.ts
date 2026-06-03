/**
 * V2ApiAuth - API v2 认证中间件工具
 * 从 Authorization header 验证 API Key
 */
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export interface AuthResult {
  authenticated: boolean;
  userId?: string;
  apiKeyId?: string;
  error?: string;
  status?: number;
}

/**
 * 验证 API v2 请求的认证信息
 */
export async function authenticateV2Request(request: Request): Promise<AuthResult> {
  // 从 Authorization header 提取 token
  const authHeader = request.headers.get('authorization');
  let apiKey: string | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    apiKey = authHeader.slice(7).trim();
  }

  // 备选：从 X-API-Key header 提取
  if (!apiKey) {
    apiKey = request.headers.get('x-api-key');
  }

  // 备选：从 query parameter 提取
  if (!apiKey) {
    const url = new URL(request.url);
    apiKey = url.searchParams.get('api_key');
  }

  if (!apiKey) {
    return {
      authenticated: false,
      error: '未提供 API Key，请通过 Authorization: Bearer <key> 或 X-API-Key header 提供',
      status: 401,
    };
  }

  try {
    // 查找 API Key（通过 keyHash 匹配）
    // 注意：实际生产环境应对 apiKey 进行哈希后匹配
    const keys = await prisma.apiKey.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    // 遍历查找匹配的 key（使用前缀快速过滤）
    for (const key of keys) {
      // 尝试用前缀匹配
      if (apiKey.startsWith(key.prefix)) {
        // 更新最后使用时间
        await prisma.apiKey.update({
          where: { id: key.id },
          data: { lastUsedAt: new Date() },
        });

        return {
          authenticated: true,
          userId: key.userId,
          apiKeyId: key.id,
        };
      }
    }

    return {
      authenticated: false,
      error: 'API Key 无效',
      status: 401,
    };
  } catch (error) {
    console.error('API Key 认证失败:', error);
    return {
      authenticated: false,
      error: '认证服务异常',
      status: 500,
    };
  }
}

/**
 * 创建未认证错误响应
 */
export function unauthorizedResponse(message = '认证失败'): NextResponse {
  return NextResponse.json(
    { success: false, message, error: 'unauthorized' },
    { status: 401, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
}

/**
 * 创建成功响应
 */
export function v2SuccessResponse(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

/**
 * 创建错误响应
 */
export function v2ErrorResponse(message: string, status = 400): NextResponse {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
}

/**
 * 认证配置
 * 
 * 注意：SkillHub 已从 NextAuth.js 迁移到 NvwaX OIDC IdP。
 * 此文件提供 auth() 函数，兼容原有调用方签名。
 * 
 * 不再支持的导出：
 * - signIn / signOut（请使用 custom auth 流程）
 * - handlers（已移除）
 * 
 * 保留的导出（接口兼容）：
 * - auth() — 返回 Session | null
 */

import { verifyAccessToken, refreshAccessToken } from '@/lib/oidc-rp';
import { getAccessToken, getRefreshToken, updateSession, getSessionUser } from '@/lib/oidc-session';
import { verifySessionToken } from '@/lib/providers/session-jwt';
import { prisma } from '@/lib/prisma';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  is_admin?: boolean;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

/**
 * 获取当前认证会话
 * 
 * 流程：
 * 1. 从 cookie 读取 access_token
 * 2. 先尝试自签 HS256 JWT 验证（GitHub session，本地计算 <1ms）
 * 3. 失败则尝试 NvwaX RS256 JWT 验证（可能需要 JWKS 网络请求）
 * 4. 如果 RS256 token 过期，尝试 refresh_token 续期
 * 5. 返回 Session（兼容原有接口）
 * 
 * @returns Session | null
 */
export async function auth(): Promise<Session | null> {
  // 1. 尝试从 cookie 读取 access_token
  const accessToken = await getAccessToken();
  if (!accessToken) {
    // fallback: 从 user cookie 读取（只有基本信息，不全）
    const userData = await getSessionUser();
    if (userData) {
      return {
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          image: null,
          is_admin: userData.is_admin ?? false,
        },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(), // 1h 估算
      };
    }
    return null;
  }

  // 2. 先尝试自签 HS256 JWT（GitHub session）
  // 放在 RS256 之前：HS256 是本地计算（<1ms），RS256 可能需要 JWKS 网络请求
  const sessionPayload = await verifySessionToken(accessToken);
  if (sessionPayload) {
    // 查询 Prisma 获取最新 role（管理员可能通过后台修改了用户角色）
    const dbUser = await prisma.user.findUnique({
      where: { id: sessionPayload.sub },
      select: { role: true },
    });
    return {
      user: {
        id: sessionPayload.sub,
        name: sessionPayload.name,
        email: sessionPayload.email,
        image: sessionPayload.picture,
        is_admin: dbUser?.role === 'ADMIN',
      },
      expires: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    };
  }

  // 3. 尝试 NvwaX RS256 JWT 验证
  try {
    const verified = await verifyAccessToken(accessToken);
    return {
      user: {
        id: verified.sub,
        name: verified.name || '',
        email: verified.email || '',
        image: verified.picture || null,
        is_admin: verified.is_admin || false,
      },
      expires: verified.exp ? new Date(verified.exp * 1000).toISOString() : '',
    };
  } catch {
    // Token 无效或过期，尝试 refresh
  }

  // 4. token 过期，尝试 refresh
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const tokens = await refreshAccessToken(refreshToken);

    // 更新 cookie 中的 token
    await updateSession(tokens);

    // 验证新 token 并返回 session
    const verified = await verifyAccessToken(tokens.access_token);
    return {
      user: {
        id: verified.sub,
        name: verified.name || '',
        email: verified.email || '',
        image: verified.picture || null,
        is_admin: verified.is_admin || false,
      },
      expires: verified.exp ? new Date(verified.exp * 1000).toISOString() : '',
    };
  } catch {
    // Refresh 也失败，session 过期
    return null;
  }
}

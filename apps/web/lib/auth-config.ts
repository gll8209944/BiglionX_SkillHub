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
 * 2. 尝试验证（解码 + RS256 签名校验）
 * 3. 如果 token 过期，尝试 refresh_token 续期
 * 4. 返回 Session（兼容原有接口）
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

  // 2. 尝试验证
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

  // 3. token 过期，尝试 refresh
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

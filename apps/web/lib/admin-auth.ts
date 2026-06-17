/**
 * 管理员认证工具
 * 
 * 注意：从 NextAuth 迁移到 NvwaX OIDC 后，管理员权限通过 access_token 中的
 * is_admin claim 判断（由 IdP 注入，参 NvwaX Sprint 2.4-A）。
 */

import { auth } from '@/lib/auth-config';
import { redirect } from 'next/navigation';

/**
 * 检查用户是否为管理员
 * @returns 用户会话信息
 * @throws 如果用户未登录或不是管理员，则重定向
 */
export async function requireAdmin() {
  const session = await auth();

  // 检查是否登录
  if (!session?.user) {
    redirect('/login');
  }

  // 检查 is_admin claim
  if (!session.user.is_admin) {
    redirect('/dashboard');
  }

  return session;
}

/**
 * 检查用户是否有管理员权限（不重定向，返回布尔值）
 * @returns 是否有管理员权限
 */
export async function checkAdminPermission(): Promise<boolean> {
  const session = await auth();
  return !!session?.user?.is_admin;
}

/**
 * 获取当前用户的角色
 * @returns 'ADMIN' | 'USER' | null
 */
export async function getUserRole(): Promise<string | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return session.user.is_admin ? 'ADMIN' : 'USER';
}

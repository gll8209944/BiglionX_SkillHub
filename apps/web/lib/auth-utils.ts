/**
 * 认证工具函数
 */

import { auth } from './auth-config';

interface SessionUser {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

/**
 * 检查用户是否为管理员
 * @param user 用户对象
 * @returns 是否为管理员
 */
export function isAdmin(user: SessionUser | null | undefined): boolean {
  if (!user || !user.email) {
    return false;
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];
  
  return adminEmails.includes(user.email);
}

/**
 * 验证管理员会话
 * @returns 如果是管理员则返回会话，否则返回 null
 */
export async function requireAdminSession() {
  const session = await auth();
  
  if (!session?.user) {
    return null;
  }

  if (!isAdmin(session.user)) {
    return null;
  }

  return session;
}

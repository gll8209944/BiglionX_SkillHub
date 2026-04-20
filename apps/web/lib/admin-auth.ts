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

  // 检查是否为管理员
  // 注意：需要先在数据库中为用户设置 role 字段
  // 临时方案：检查邮箱是否在管理员列表中
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const isAdmin = adminEmails.includes(session.user.email || '');

  if (!isAdmin) {
    // 如果不是管理员，重定向到首页
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

  if (!session?.user) {
    return false;
  }

  // 检查邮箱是否在管理员列表中
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(session.user.email || '');
}

/**
 * 获取当前用户的角色
 * @returns 用户角色
 */
export async function getUserRole(): Promise<string | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // TODO: 从数据库获取用户角色
  // 目前使用邮箱列表作为临时方案
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  if (adminEmails.includes(session.user.email || '')) {
    return 'ADMIN';
  }

  return 'USER';
}

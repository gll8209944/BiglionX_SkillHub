import { auth } from '@/lib/auth-config';

// 重新导出 auth 函数
export { auth };

/**
 * 获取当前会话
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * 检查用户是否已登录
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('未授权访问');
  }
  return user;
}

/**
 * 检查用户是否为管理员
 * 从 access_token 的 is_admin claim 校验
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    throw new Error('未授权访问');
  }

  if (!session.user.is_admin) {
    throw new Error('需要管理员权限');
  }

  return session.user;
}

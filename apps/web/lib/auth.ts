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
 */
export async function requireAdmin() {
  const user = await requireAuth();
  // TODO: 实现管理员检查逻辑
  // const dbUser = await prisma.user.findUnique({
  //   where: { id: user.id },
  // });
  // if (!dbUser?.role || dbUser.role !== 'ADMIN') {
  //   throw new Error('需要管理员权限');
  // }
  return user;
}

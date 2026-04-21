import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';

/**
 * GET /api/auth/redirect-url
 * 根据用户角色返回合适的重定向URL
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ redirectUrl: '/dashboard' });
    }

    // 检查用户是否为管理员
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAdmin = adminEmails.includes(session.user.email);

    // 也可以从数据库检查role字段（如果已实现）
    // const user = await prisma.user.findUnique({
    //   where: { email: session.user.email },
    //   select: { role: true },
    // });
    // const isAdmin = user?.role === 'ADMIN';

    const redirectUrl = isAdmin ? '/admin' : '/dashboard';
    
    return NextResponse.json({ redirectUrl });
  } catch (error) {
    console.error('获取重定向URL失败:', error);
    return NextResponse.json({ redirectUrl: '/dashboard' });
  }
}

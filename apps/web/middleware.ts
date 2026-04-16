import { auth } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function middleware() {
  const session = await auth();

  // 如果没有登录，重定向到登录页面
  if (!session) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  }

  return NextResponse.next();
}

// 配置需要保护的路由
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/skills/:path*',
    '/namespaces/:path*',
    '/settings/:path*',
  ],
};

import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { NextResponse } from 'next/server';

const { auth } = NextAuth({
  providers: [GitHub],
  session: { strategy: 'jwt' },
});

export async function middleware() {
  const session = await auth();
  if (!session) {
    return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000'));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',     // 用户仪表板 - 需要登录
    '/api/skills/publish',   // 发布技能 API - 需要登录
    '/api/namespaces/:path*', // 命名空间管理 API - 需要登录
    // 注意：/skills 和 /namespaces 浏览页面是公开的，不需要登录
  ],
};

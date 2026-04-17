import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

// ============================================
// 中间件配置（Edge Runtime）
// 仅用于 session 验证，不使用 Prisma（Edge 不支持 Prisma）
// ============================================

export const middlewareConfig = {
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verify',
    error: '/login/error',
  },
  session: {
    strategy: 'jwt' as const,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

// 用于中间件（Edge Runtime）
export const { auth: middlewareAuth } = NextAuth(middlewareConfig);

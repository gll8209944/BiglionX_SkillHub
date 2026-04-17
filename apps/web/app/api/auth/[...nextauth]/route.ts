import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
// import Nodemailer from 'next-auth/providers/nodemailer'; // 暂时禁用，需要 Prisma Adapter

// API routes 配置（Node.js Runtime）
// 使用 JWT session（与中间件保持一致）
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    // Nodemailer 需要 PrismaAdapter 存储验证码，暂时禁用
    // 启用邮箱登录需安装 @auth/prisma-adapter 并配置 Prisma
    // Nodemailer({ ... })
  ],
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verify',
    error: '/login/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.id = profile.id || profile.sub;
        token.name = profile.name as string | undefined;
        token.email = profile.email as string | undefined;
        // GitHub profile 可能包含 avatar_url 或 image
        const githubProfile = profile as Record<string, unknown>;
        token.picture = (githubProfile.avatar_url || githubProfile.image) as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
  },
});

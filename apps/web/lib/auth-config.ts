import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Resend from 'next-auth/providers/resend';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// NextAuth 配置（用于 server-side 调用）
const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY || '',
      from: process.env.EMAIL_FROM || 'SkillHub <noreply@skillhub.com>',
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            password: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        // 验证密码
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
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
    async signIn({ user, account }) {
      // 处理 OAuthAccountNotLinked 错误
      // 如果用户使用 OAuth 登录，且邮箱已存在，自动关联账号
      if (account?.provider === 'github' && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          // 检查是否已经关联了 GitHub 账号
          const existingAccount = await prisma.account.findFirst({
            where: {
              userId: existingUser.id,
              provider: 'github',
            },
          });

          // 如果没有关联，则自动创建关联
          if (!existingAccount) {
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }
          
          // 更新用户信息（如果有变化）
          if (user.name && user.name !== existingUser.name) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name,
                image: user.image || existingUser.image,
              },
            });
          }
        }
      }
      
      return true;
    },
    async redirect({ url, baseUrl }) {
      // 处理登录后的重定向
      // 如果是相对路径，使用 baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // 如果是同域名的绝对路径
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      // 默认返回 baseUrl
      return baseUrl;
    },
    async jwt({ token, profile, user }) {
      if (user) {
        token.id = user.id;
      }
      if (profile) {
        token.id = profile.id || profile.sub || token.id;
        token.name = profile.name as string | undefined;
        token.email = profile.email as string | undefined;
        const githubProfile = profile as Record<string, unknown>;
        token.picture = (githubProfile.avatar_url || githubProfile.image) as string | undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | undefined;
      }
      return session;
    },
  },
});

export const { auth, signIn, signOut, handlers } = nextAuth;

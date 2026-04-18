import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';

// API Route handlers
const nextAuth = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
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
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.id = profile.id || profile.sub;
        token.name = profile.name as string | undefined;
        token.email = profile.email as string | undefined;
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

export const { GET, POST } = nextAuth.handlers;

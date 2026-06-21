/**
 * GET /oauth/callback
 *
 * OAuth 回调处理：
 * - ?provider=github → GitHub OAuth 回调
 * - 无 provider 参数 → NvwaX OIDC 回调
 *
 * NvwaX OIDC 流程：
 * 1. 校验 state（防 CSRF）
 * 2. 读取 code_verifier（从 cookie）
 * 3. 调 token 端点换 token
 * 4. 查/建 Prisma User
 * 5. 设置 session cookie
 * 6. 302 到原访问页或 /dashboard
 *
 * ⚠️ 路径必须为 /oauth/callback：与 NvwaX OIDC IdP
 * （account.proclaw.cc）数据库中为 SkillHub 注册的回调路径严格匹配，
 * 否则 IdP 会拒绝 redirect_uri 校验并报 invalid_request。
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { exchangeCodeForToken, getUserInfo } from '@/lib/oidc-rp';
import {
  getCodeVerifier,
  getOAuthState,
  createSession,
  clearSession,
  createGitHubSession,
} from '@/lib/oidc-session';
import { exchangeGitHubCode, getGitHubUser, getGitHubEmails } from '@/lib/providers/github';
import { signSessionToken } from '@/lib/providers/session-jwt';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');

  // === GitHub 回调处理 ===
  if (provider === 'github') {
    return handleGitHubCallback(request, searchParams);
  }

  // === NvwaX OIDC 回调处理（现有逻辑） ===
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // IdP 返回的错误
  if (error) {
    console.error('[OIDC Callback] IdP error:', error, searchParams.get('error_description'));
    return NextResponse.redirect(new URL('/auth/login?error=oidc_error', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=missing_code', request.url));
  }

  try {
    // 1. 校验 state
    const storedState = await getOAuthState();
    if (state && storedState && state !== storedState) {
      console.error('[OIDC Callback] State mismatch');
      return NextResponse.redirect(new URL('/auth/login?error=state_mismatch', request.url));
    }

    // 2. 读取 code_verifier
    const codeVerifier = await getCodeVerifier();
    if (!codeVerifier) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_verifier', request.url));
    }

    // 3. 换 token
    const tokens = await exchangeCodeForToken(code, codeVerifier);

    // 4. 获取用户信息
    const userInfo = await getUserInfo(tokens.access_token);
    if (!userInfo.email) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_email', request.url));
    }

    // 5. 查/建 Prisma User（同步 is_admin → User.role）
    const isAdmin = Boolean(userInfo.is_admin);
    await prisma.user.upsert({
      where: { email: userInfo.email },
      update: {
        name: userInfo.name || undefined,
        image: userInfo.picture || undefined,
        // 同步 admin 状态（userinfo 优先；降权时也要写回 USER）
        role: isAdmin ? 'ADMIN' : 'USER',
      },
      create: {
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split('@')[0],
        image: userInfo.picture || null,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
    });

    // 6. 设置 session cookie
    await createSession(tokens);

    // 7. 获取原访问页
    const returnUrl = searchParams.get('return_url') || '/dashboard';

    return NextResponse.redirect(new URL(returnUrl, request.url));
  } catch (err) {
    console.error('[OIDC Callback] Error:', err);
    // 清除可能残留的 cookie
    await clearSession().catch(() => {});
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url));
  }
}

/**
 * 处理 GitHub OAuth 回调
 */
async function handleGitHubCallback(request: NextRequest, searchParams: URLSearchParams) {
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/auth/login?error=github_denied', request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_callback', request.url));
  }

  // 1. 校验 state（复用现有 cookie 机制）
  const storedState = await getOAuthState();
  if (state !== storedState) {
    return NextResponse.redirect(new URL('/auth/login?error=state_mismatch', request.url));
  }

  try {
    // 2. 换取 GitHub access_token
    const tokenResponse = await exchangeGitHubCode(code);

    // 3. 获取用户信息
    const githubUser = await getGitHubUser(tokenResponse.access_token);

    // 4. 获取邮箱（GitHub 可能不返回 email）
    let email = githubUser.email;
    if (!email) {
      const emails = await getGitHubEmails(tokenResponse.access_token);
      const primaryEmail = emails.find(e => e.primary && e.verified);
      email = primaryEmail?.email || `${githubUser.login}@github.local`;
    }

    // 5. 查/建 Prisma User
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: githubUser.name || githubUser.login,
        image: githubUser.avatar_url,
      },
      create: {
        email,
        name: githubUser.name || githubUser.login,
        image: githubUser.avatar_url,
        role: 'USER',
      },
    });

    // 6. 创建 Account 关联（如果不存在）
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'github',
          providerAccountId: String(githubUser.id),
        },
      },
      update: {
        access_token: tokenResponse.access_token,
        scope: tokenResponse.scope,
      },
      create: {
        userId: user.id,
        type: 'oauth',
        provider: 'github',
        providerAccountId: String(githubUser.id),
        access_token: tokenResponse.access_token,
        token_type: tokenResponse.token_type,
        scope: tokenResponse.scope,
      },
    });

    // 7. 签发自签 Session JWT
    const sessionToken = await signSessionToken({
      sub: user.id,
      email: user.email,
      name: user.name || user.email,
      picture: user.image,
      provider: 'github',
    });

    // 8. 设置 cookie
    await createGitHubSession(sessionToken, {
      id: user.id,
      name: user.name || user.email,
      email: user.email,
      is_admin: user.role === 'ADMIN',
    });

    // 9. 重定向
    const returnUrl = searchParams.get('return_url') || '/dashboard';
    return NextResponse.redirect(new URL(returnUrl, request.url));

  } catch (err) {
    console.error('[GitHub Callback] Error:', err);
    await clearSession().catch(() => {});
    return NextResponse.redirect(new URL('/auth/login?error=github_callback_error', request.url));
  }
}

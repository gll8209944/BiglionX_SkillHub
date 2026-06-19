/**
 * GET /oauth/callback
 *
 * OIDC Authorization Code 回调处理：
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
} from '@/lib/oidc-session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
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

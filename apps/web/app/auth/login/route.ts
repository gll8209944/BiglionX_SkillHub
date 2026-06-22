/**
 * GET /auth/login
 *
 * 发起 OIDC Authorization Code + PKCE 流程：
 * 1. 生成 PKCE pair
 * 2. 生成随机 state（防 CSRF）
 * 3. 存 code_verifier + state 到短期 httpOnly cookie
 * 4. 302 重定向到 account.proclaw.cc/oauth/authorize
 *
 * 支持 ?provider=github 参数发起 GitHub OAuth 流程
 */

import { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { generatePKCE, getAuthorizationUrl } from '@/lib/oidc-rp';
import { setCodeVerifierCookie, setOAuthStateCookie } from '@/lib/oidc-session';
import { getGitHubAuthUrl } from '@/lib/providers/github';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get('error');
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error)}`);
  }

  const provider = request.nextUrl.searchParams.get('provider');

  // === GitHub OAuth 流程 ===
  if (provider === 'github') {
    const state = randomBytes(32).toString('hex');
    await setOAuthStateCookie(state);
    const url = getGitHubAuthUrl(state);
    redirect(url);
  }

  // === 现有 NvwaX OIDC 流程 ===
  // 1. 生成 PKCE pair
  const { codeVerifier, codeChallenge } = await generatePKCE();

  // 2. 生成随机 state
  const state = randomBytes(32).toString('hex');

  // 3. 存到 cookie（短期）
  await setCodeVerifierCookie(codeVerifier);
  await setOAuthStateCookie(state);

  // 4. 构建 authorize URL 并重定向（端点从 discovery 异步获取）
  const authorizationUrl = await getAuthorizationUrl(state, codeChallenge);

  redirect(authorizationUrl);
}

/**
 * GET /auth/login
 * 
 * 发起 OIDC Authorization Code + PKCE 流程：
 * 1. 生成 PKCE pair
 * 2. 生成随机 state（防 CSRF）
 * 3. 存 code_verifier + state 到短期 httpOnly cookie
 * 4. 302 重定向到 account.proclaw.cc/oauth/authorize
 */

import { redirect } from 'next/navigation';
import { generatePKCE, getAuthorizationUrl } from '@/lib/oidc-rp';
import { setCodeVerifierCookie, setOAuthStateCookie } from '@/lib/oidc-session';
import { randomBytes } from 'crypto';

export async function GET() {
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

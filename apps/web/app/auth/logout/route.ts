/**
 * GET /auth/logout
 * 
 * 登出流程：
 * 1. 在 IdP 端撤销 refresh_token（尽力而为）
 * 2. 清除 SkillHub session cookies
 * 3. 302 跳转到 account.proclaw.cc 登录页（允许用户重新登录）
 */

import { NextResponse } from 'next/server';
import { logout as oidcLogout } from '@/lib/oidc-rp';
import { getRefreshToken, clearSession } from '@/lib/oidc-session';

export async function GET() {
  // 1. 读取 refresh_token 并在 IdP 端撤销
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    // 尽力而为，不阻塞登出
    await oidcLogout(refreshToken).catch(() => {});
  }

  // 2. 清除本地 session
  await clearSession();

  // 3. 重定向到 IdP 登录页，允许用户重新登录其他账号
  return NextResponse.redirect('https://account.proclaw.cc');
}

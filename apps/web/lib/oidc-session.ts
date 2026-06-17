/**
 * OIDC Cookie 会话管理
 * 
 * 基于 httpOnly cookie 存储 OIDC tokens，避免服务端 session 存储。
 * 
 * Cookie 命名规范：
 * - skillhub_access_token  —  httpOnly, 用于 API 鉴权
 * - skillhub_refresh_token —  httpOnly, 用于 token 续期
 * - skillhub_user          —  非 httpOnly, 客户端可读的 JSON user 信息
 * - skillhub_code_verifier —  httpOnly, OAuth 回调时使用（5 分钟短期）
 * - skillhub_oauth_state   —  httpOnly, CSRF 防护（5 分钟短期）
 */

import { cookies } from 'next/headers';
import type { TokenResponse } from './oidc-rp';

// Cookie 名称常量
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'skillhub_access_token',
  REFRESH_TOKEN: 'skillhub_refresh_token',
  USER: 'skillhub_user',
  CODE_VERIFIER: 'skillhub_code_verifier',
  OAUTH_STATE: 'skillhub_oauth_state',
} as const;

// Session 有效期（7 天，与 IdP 一致）
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * 从 env 读取 sameSite 配置（生产环境 SSO 跨域需要 none）
 * 默认 dev=lax，生产需显式设置 SESSION_COOKIE_SAMESITE=none
 */
function resolveSameSite(): 'lax' | 'strict' | 'none' {
  const raw = (process.env.SESSION_COOKIE_SAMESITE || '').toLowerCase();
  if (raw === 'none' || raw === 'strict' || raw === 'lax') {
    return raw as 'lax' | 'strict' | 'none';
  }
  return 'lax';
}

/**
 * 从 env 读取 secure 配置
 * 生产默认 true，dev 默认 false（除非显式开启）
 */
function resolveSecure(): boolean {
  if (process.env.SESSION_COOKIE_SECURE === 'true') return true;
  if (process.env.SESSION_COOKIE_SECURE === 'false') return false;
  return process.env.NODE_ENV === 'production';
}

// Cookie 基础选项
const BASE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: resolveSecure(),
  sameSite: resolveSameSite(),
  path: '/',
};

// ============================================================
// Session 创建/清除
// ============================================================

/**
 * 创建 OIDC session，设置 access_token / refresh_token / user 三个 cookie
 * 
 * @param tokens TokenResponse（从 exchangeCodeForToken / refreshAccessToken 返回）
 */
export async function createSession(tokens: TokenResponse): Promise<void> {
  const cookieStore = await cookies();
  const baseDomain = extractDomain();

  const accessTokenOptions = {
    ...BASE_COOKIE_OPTIONS,
    maxAge: tokens.expires_in,
    ...(baseDomain ? { domain: baseDomain } : {}),
  };

  const refreshTokenOptions = {
    ...BASE_COOKIE_OPTIONS,
    maxAge: SESSION_MAX_AGE,
    ...(baseDomain ? { domain: baseDomain } : {}),
  };

  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.access_token, accessTokenOptions);
  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh_token, refreshTokenOptions);

  // 非 httpOnly cookie，客户端可读
  // 但不存敏感信息，只存基本的 user 显示信息
  const userInfo = extractUserFromToken(tokens);
  if (userInfo) {
    cookieStore.set(COOKIE_NAMES.USER, JSON.stringify(userInfo), {
      ...BASE_COOKIE_OPTIONS,
      httpOnly: false,
      maxAge: SESSION_MAX_AGE,
      ...(baseDomain ? { domain: baseDomain } : {}),
    });
  }
}

/**
 * 清除所有 session cookie
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, '', { ...BASE_COOKIE_OPTIONS, maxAge: 0 });
  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, '', { ...BASE_COOKIE_OPTIONS, maxAge: 0 });
  cookieStore.set(COOKIE_NAMES.USER, '', { ...BASE_COOKIE_OPTIONS, httpOnly: false, maxAge: 0 });
  cookieStore.set(COOKIE_NAMES.CODE_VERIFIER, '', { ...BASE_COOKIE_OPTIONS, maxAge: 0 });
  cookieStore.set(COOKIE_NAMES.OAUTH_STATE, '', { ...BASE_COOKIE_OPTIONS, maxAge: 0 });
}

/**
 * 在 Response 对象上设置 session cookie（用于 Route Handler 中 auth() refresh 场景）
 */
export function setSessionCookiesOnResponse(
  response: Response,
  tokens: TokenResponse,
): void {
  const baseDomain = extractDomain();

  const headers = new Headers(response.headers);

  const setCookie = (name: string, value: string, maxAge: number, httpOnly = true) => {
    const parts = [
      `${name}=${value}`,
      `Max-Age=${maxAge}`,
      `Path=/`,
      httpOnly ? 'HttpOnly' : '',
      BASE_COOKIE_OPTIONS.secure ? 'Secure' : '',
      `SameSite=${BASE_COOKIE_OPTIONS.sameSite}`,
      baseDomain ? `Domain=${baseDomain}` : '',
    ].filter(Boolean).join('; ');

    headers.append('Set-Cookie', parts);
  };

  setCookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.access_token, tokens.expires_in);
  setCookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh_token, SESSION_MAX_AGE);

  const userInfo = extractUserFromToken(tokens);
  if (userInfo) {
    setCookie(COOKIE_NAMES.USER, JSON.stringify(userInfo), SESSION_MAX_AGE, false);
  }

  // 注意：Response 的 headers 是只读的，需要新建 Response
  Object.defineProperty(response, 'headers', {
    value: headers,
    writable: false,
  });
}

// ============================================================
// Token 读取
// ============================================================

/**
 * 从当前请求中读取 access_token
 */
export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
}

/**
 * 从当前请求中读取 refresh_token
 */
export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
}

/**
 * 从当前请求中读取 code_verifier
 */
export async function getCodeVerifier(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.CODE_VERIFIER)?.value;
}

/**
 * 从当前请求中读取 oauth_state
 */
export async function getOAuthState(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.OAUTH_STATE)?.value;
}

/**
 * 读取客户端可读的 user cookie
 *
 * 注意：is_admin 可能为空（cookie 未携带该字段），调用方应
 * 把它当作不权威（权威来源是 Prisma User.role）。
 */
export async function getSessionUser(): Promise<
  { id: string; name: string; email: string; is_admin?: boolean } | null
> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAMES.USER)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ============================================================
// Short-lived cookies (OAuth flow)
// ============================================================

/**
 * 设置 code_verifier cookie（5 分钟有效期）
 */
export async function setCodeVerifierCookie(codeVerifier: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES.CODE_VERIFIER, codeVerifier, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 300, // 5 分钟
  });
}

/**
 * 设置 oauth_state cookie（5 分钟有效期，防 CSRF）
 */
export async function setOAuthStateCookie(state: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAMES.OAUTH_STATE, state, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 300, // 5 分钟
  });
}

// ============================================================
// 更新 session（refresh 时使用）
// ============================================================

/**
 * 更新 session cookie（refresh token 续期后）
 */
export async function updateSession(tokens: TokenResponse): Promise<void> {
  const cookieStore = await cookies();

  const baseDomain = extractDomain();
  const domainOption = baseDomain ? { domain: baseDomain } : {};

  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.access_token, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: tokens.expires_in,
    ...domainOption,
  });

  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh_token, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: SESSION_MAX_AGE,
    ...domainOption,
  });
}

// ============================================================
// 工具函数
// ============================================================

/**
 * 从 URL 提取域名部分用于跨子域 cookie
 * 例如: https://skillhub.proclaw.cc → .proclaw.cc
 */
function extractDomain(): string | undefined {
  const url = process.env.NEXT_PUBLIC_APP_URL || '';
  try {
    const hostname = new URL(url).hostname;
    // 只对 proclaw.cc 子域名启用跨域 cookie
    if (hostname.endsWith('.proclaw.cc')) {
      return '.proclaw.cc';
    }
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return undefined; // localhost 不支持 domain cookie
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * 从 id_token 中提取基本用户信息（用于 skillhub_user cookie）
 * 包含 is_admin 供前端判断（仅供 UI 展示，权威判断看 Prisma User.role）
 */
function extractUserFromToken(
  tokens: TokenResponse,
): { id: string; name: string; email: string; is_admin: boolean } | null {
  if (!tokens.id_token) return null;
  try {
    // id_token 是 JWT：header.payload.signature
    const parts = tokens.id_token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      typeof Buffer !== 'undefined'
        ? Buffer.from(parts[1], 'base64url').toString('utf-8')
        : atob(parts[1]),
    );
    return {
      id: payload.sub || '',
      name: payload.name || '',
      email: payload.email || '',
      is_admin: Boolean(payload.is_admin),
    };
  } catch {
    return null;
  }
}

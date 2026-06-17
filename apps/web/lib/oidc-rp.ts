/**
 * NvwaX OIDC RP 客户端
 * 
 * 封装与 account.proclaw.cc 的全部 OIDC 通信：
 * - PKCE (S256) 生成
 * - Authorization Code 流程
 * - Token 换取/续期/撤销
 * - UserInfo 查询
 * - RS256 JWT 验证（JWKS）
 * 
 * 对接端点（Sprint 1 冻结契约）：
 * - /oauth/authorize
 * - /oauth/token
 * - /oauth/userinfo
 * - /oauth/logout
 * - /.well-known/jwks.json
 */

import { jwtVerify, createRemoteJWKSet, base64url } from 'jose';
import type { JWTPayload } from 'jose';

// ============================================================
// 类型定义
// ============================================================

/** OIDC Token 端点响应 */
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

/** UserInfo 端点响应 */
export interface UserInfoResponse {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  [key: string]: unknown;
}

/** 验证后的 Access Token 内容 */
export interface VerifiedToken extends JWTPayload {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  is_admin?: boolean;
  scope?: string;
}

/** PKCE pair */
export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
}

/** OIDC 错误码（Sprint 1 冻结契约） */
export type OidcErrorCode =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'invalid_scope'
  | 'unsupported_grant_type'
  | 'server_error';

/** OIDC 错误 */
export class OidcError extends Error {
  constructor(
    public code: OidcErrorCode,
    message: string,
    public status?: number,
  ) {
    super(`[${code}] ${message}`);
    this.name = 'OidcError';
  }
}

// ============================================================
// 配置
// ============================================================

export const OIDC_CONFIG = {
  issuer: 'https://account.proclaw.cc',
  authorizationEndpoint: 'https://account.proclaw.cc/oauth/authorize',
  tokenEndpoint: 'https://account.proclaw.cc/oauth/token',
  userinfoEndpoint: 'https://account.proclaw.cc/oauth/userinfo',
  logoutEndpoint: 'https://account.proclaw.cc/oauth/logout',
  jwksUri: 'https://account.proclaw.cc/.well-known/jwks.json',
  get clientId() {
    return process.env.SKILLHUB_OIDC_CLIENT_ID || '';
  },
  get clientSecret() {
    return process.env.SKILLHUB_OIDC_CLIENT_SECRET || '';
  },
  get redirectUri() {
    return `${process.env.NEXT_PUBLIC_APP_URL || 'https://skillhub.proclaw.cc'}/auth/callback`;
  },
} as const;

// ============================================================
// PKCE
// ============================================================

/**
 * 生成 PKCE S256 code_verifier 和 code_challenge
 * 
 * code_verifier: 43-128 个字符的随机字符串（[A-Za-z0-9-._~]）
 * code_challenge: 对 verifier 做 SHA-256 后 base64url 编码
 */
export async function generatePKCE(): Promise<PKCEPair> {
  // 生成 64 字节随机数（约 86 base64url 字符，符合 43-128 要求）
  const randomBytes = new Uint8Array(64);
  crypto.getRandomValues(randomBytes);
  const codeVerifier = base64url.encode(randomBytes);

  // SHA-256 编码
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier));
  const codeChallenge = base64url.encode(new Uint8Array(hashBuffer));

  return { codeVerifier, codeChallenge };
}

// ============================================================
// Authorization URL
// ============================================================

/**
 * 生成 OIDC authorize URL
 * 
 * @param state CSRF state（应存入 cookie 用于回调验证）
 * @param codeChallenge PKCE code_challenge
 * @param scope OAuth scope，默认为 openid profile email
 * @returns 完整的 authorize URL
 */
export function getAuthorizationUrl(
  state: string,
  codeChallenge: string,
  scope = 'openid profile email',
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: OIDC_CONFIG.clientId,
    redirect_uri: OIDC_CONFIG.redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    scope,
    state,
  });

  return `${OIDC_CONFIG.authorizationEndpoint}?${params.toString()}`;
}

// ============================================================
// Token Operations
// ============================================================

/** 标准 Token 端点请求 */
async function tokenRequest(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(OIDC_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorCode = (data.error || 'server_error') as OidcErrorCode;
    const errorDesc = data.error_description || response.statusText;
    throw new OidcError(errorCode, errorDesc, response.status);
  }

  return data as TokenResponse;
}

/**
 * 用 authorization_code 换取 token
 * 
 * @param code 授权码（从 callback query 获取）
 * @param codeVerifier PKCE code_verifier（从 cookie 获取）
 * @returns TokenResponse
 */
export async function exchangeCodeForToken(
  code: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: OIDC_CONFIG.redirectUri,
    client_id: OIDC_CONFIG.clientId,
    client_secret: OIDC_CONFIG.clientSecret,
    code_verifier: codeVerifier,
  });

  return tokenRequest(body);
}

/**
 * 用 refresh_token 换取新的 access_token
 * 
 * @param refreshToken refresh_token
 * @returns TokenResponse
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: OIDC_CONFIG.clientId,
    client_secret: OIDC_CONFIG.clientSecret,
  });

  return tokenRequest(body);
}

// ============================================================
// UserInfo
// ============================================================

/**
 * 用 access_token 获取用户信息
 * 
 * @param accessToken access_token
 * @returns UserInfoResponse
 */
export async function getUserInfo(accessToken: string): Promise<UserInfoResponse> {
  const response = await fetch(OIDC_CONFIG.userinfoEndpoint, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const errorCode = (data.error || 'server_error') as OidcErrorCode;
    throw new OidcError(errorCode, data.error_description || 'Failed to fetch userinfo', response.status);
  }

  return response.json() as Promise<UserInfoResponse>;
}

// ============================================================
// Logout
// ============================================================

/**
 * 在 IdP 端撤销 refresh_token
 * 
 * @param refreshToken 要撤销的 refresh_token
 */
export async function logout(refreshToken: string): Promise<void> {
  try {
    const response = await fetch(OIDC_CONFIG.logoutEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body: new URLSearchParams({
        client_id: OIDC_CONFIG.clientId,
        client_secret: OIDC_CONFIG.clientSecret,
        refresh_token: refreshToken,
      }).toString(),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const code = (data.error || 'server_error') as OidcErrorCode;
      console.warn(`[OIDC] Logout warning: ${code}`, data.error_description);
    }
  } catch (err) {
    // 登出是尽力而为的操作，不抛出错误
    console.warn('[OIDC] Logout network error (non-fatal):', err);
  }
}

// ============================================================
// JWT Verification
// ============================================================

/** JWKS 客户端缓存 */
let jwksClient: ReturnType<typeof createRemoteJWKSet> | null = null;
/** JWKS 缓存时间戳 */
let jwksCacheTimestamp = 0;
/** JWKS 缓存 TTL（1 小时） */
const JWKS_CACHE_TTL = 60 * 60 * 1000;

/**
 * 获取或创建缓存的 JWKS 客户端
 */
function getJwksClient() {
  const now = Date.now();
  if (!jwksClient || now - jwksCacheTimestamp > JWKS_CACHE_TTL) {
    jwksClient = createRemoteJWKSet(new URL(OIDC_CONFIG.jwksUri));
    jwksCacheTimestamp = now;
  }
  return jwksClient;
}

/**
 * 重置 JWKS 缓存（用于测试）
 */
export function resetJwksCache(): void {
  jwksClient = null;
  jwksCacheTimestamp = 0;
}

/**
 * 验证 access_token 的 RS256 签名并解码 claims
 * 
 * @param accessToken access_token（JWT）
 * @returns 解码后的 token claims
 * @throws OidcError 如果 token 无效或签名验证失败
 */
export async function verifyAccessToken(accessToken: string): Promise<VerifiedToken> {
  try {
    const client = getJwksClient();
    const { payload } = await jwtVerify(accessToken, client, {
      issuer: OIDC_CONFIG.issuer,
      algorithms: ['RS256'],
    });

    return payload as VerifiedToken;
  } catch (err) {
    if (err instanceof OidcError) throw err;

    const message = err instanceof Error ? err.message : 'Unknown verification error';
    if (message.includes('exp') || message.includes('expired')) {
      throw new OidcError('invalid_grant', 'Access token expired', 401);
    }
    throw new OidcError('server_error', message, 401);
  }
}

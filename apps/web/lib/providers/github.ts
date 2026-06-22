/**
 * GitHub OAuth Provider
 *
 * 实现 GitHub OAuth 2.0 授权码流程（非 PKCE，使用 client_secret）。
 * 与 NvwaX OIDC 的区别：
 * - 使用 client_secret（Confidential Client）
 * - access_token 是 opaque token，不是 JWT
 * - 无 id_token
 * - 用户信息通过 GET /user 获取
 */

import { getAppBaseUrl } from '@/lib/app-url';

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  email: string | null;
  name: string | null;
  bio: string | null;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

/**
 * 生成 GitHub 授权 URL
 *
 * 注意：GitHub 使用标准 state（CSRF 防护），不需要 PKCE code_challenge。
 * redirect_uri 中通过 query 参数 provider=github 区分回调来源。
 */
export function getGitHubAuthUrl(state: string): string {
  const redirectUri = `${getAppBaseUrl()}/oauth/callback?provider=github`;
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
  });
  return `https://github.com/login/oauth/authorize?${params}`;
}

/**
 * 用授权码换取 access_token
 *
 * GitHub token 端点需要 client_secret（与 NvwaX Public Client 不同）。
 */
export async function exchangeGitHubCode(code: string): Promise<GitHubTokenResponse> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub token exchange failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return data as GitHubTokenResponse;
}

/**
 * 获取 GitHub 用户信息
 */
export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub user fetch failed: ${response.status}`);
  }

  return response.json();
}

/**
 * 获取 GitHub 用户邮箱（当用户 profile 中 email 为 null 时使用）
 */
export async function getGitHubEmails(accessToken: string): Promise<GitHubEmail[]> {
  const response = await fetch('https://api.github.com/user/emails', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub emails fetch failed: ${response.status}`);
  }

  return response.json();
}

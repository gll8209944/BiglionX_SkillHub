/**
 * auth-callback.test.ts
 * 
 * OIDC Callback 处理测试
 * 测试覆盖：成功回调、state 校验、verifier 缺失、token 交换失败、用户 upsert
 */

import { jest } from '@jest/globals';
import type { NextRequest } from 'next/server';

// Mock all dependencies
jest.mock('@/lib/oidc-rp', () => ({
  exchangeCodeForToken: jest.fn(),
  getUserInfo: jest.fn(),
  logout: jest.fn(),
  verifyAccessToken: jest.fn(),
  generatePKCE: jest.fn(),
  getAuthorizationUrl: jest.fn(),
  refreshAccessToken: jest.fn(),
  resetJwksCache: jest.fn(),
}));

jest.mock('@/lib/oidc-session', () => {
  const mock = {} as Record<string, jest.Mock>;
  const props = ['getCodeVerifier','getOAuthState','createSession','getAccessToken','getRefreshToken','getSessionUser','setCodeVerifierCookie','setOAuthStateCookie','updateSession'];
  for (const p of props) mock[p] = jest.fn();
  mock['clearSession'] = jest.fn().mockResolvedValue(undefined);
  return mock;
});

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      upsert: jest.fn(),
      update: jest.fn(),
    },
  },
}));

const mockRedirect = jest.fn((url: string) => ({
  status: 302,
  url,
  headers: new Headers(),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: (url: string | URL) => {
      const urlStr = typeof url === 'string' ? url : url.toString();
      return mockRedirect(urlStr);
    },
    json: (data: unknown) => ({
      status: 200,
      body: data,
      headers: new Headers(),
    }),
    next: () => ({
      headers: new Headers(),
    }),
  },
}));

// Get mocked modules
const mockOidcRp = jest.requireMock('@/lib/oidc-rp') as {
  exchangeCodeForToken: jest.Mock;
  getUserInfo: jest.Mock;
};
const mockOidcSession = jest.requireMock('@/lib/oidc-session') as {
  getCodeVerifier: jest.Mock;
  getOAuthState: jest.Mock;
  createSession: jest.Mock;
  clearSession: jest.Mock;
};
const mockPrisma = jest.requireMock('@/lib/prisma') as {
  prisma: { user: { upsert: jest.Mock; update: jest.Mock } };
};

describe('auth callback handler', () => {
  let handler: typeof import('@/app/oauth/callback/route');

  beforeAll(async () => {
    process.env.SKILLHUB_OIDC_CLIENT_ID = 'test_client_id';
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.prisma.user.upsert.mockResolvedValue({ id: 'user_001', email: 'user@example.com' });
    mockPrisma.prisma.user.update.mockResolvedValue({ id: 'user_001', email: 'user@example.com' });
    handler = await import('@/app/oauth/callback/route');
  });

  // Helper to create mock request
  function mockRequest(searchParams: Record<string, string>): NextRequest {
    const url = new URL('https://skillhub.proclaw.cc/oauth/callback');
    Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
    return { url: url.toString(), nextUrl: url } as unknown as NextRequest;
  }

  test('成功回调应创建 session 并重定向到 dashboard', async () => {
    mockOidcSession.getOAuthState.mockResolvedValueOnce('test_state');
    mockOidcSession.getCodeVerifier.mockResolvedValueOnce('test_verifier');
    mockOidcRp.exchangeCodeForToken.mockResolvedValueOnce({
      access_token: 'new_access_token',
      refresh_token: 'new_refresh_token',
      token_type: 'Bearer',
      expires_in: 3600,
    });
    mockOidcRp.getUserInfo.mockResolvedValueOnce({
      sub: 'user_001',
      email: 'user@example.com',
      name: 'Test User',
    });

    const req = mockRequest({ code: 'auth_code', state: 'test_state' });
    const response = await handler.GET(req);

    expect(response.status).toBe(302);
    expect(response.url).toContain('/dashboard');
    expect(mockOidcSession.createSession).toHaveBeenCalled();
    // userinfo 不含 is_admin → role 写为 USER（默认权限）
    expect(mockPrisma.prisma.user.upsert).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      update: { name: 'Test User', image: undefined, role: 'USER' },
      create: { email: 'user@example.com', name: 'Test User', image: null, role: 'USER' },
    });
  });

  test('userinfo.is_admin=true 应同步 Prisma User.role=ADMIN', async () => {
    mockOidcSession.getOAuthState.mockResolvedValueOnce('test_state');
    mockOidcSession.getCodeVerifier.mockResolvedValueOnce('test_verifier');
    mockOidcRp.exchangeCodeForToken.mockResolvedValueOnce({
      access_token: 'admin_token',
      refresh_token: 'admin_refresh',
      token_type: 'Bearer',
      expires_in: 3600,
    });
    mockOidcRp.getUserInfo.mockResolvedValueOnce({
      sub: 'admin_001',
      email: 'admin@example.com',
      name: 'Admin User',
      is_admin: true,
    });

    const req = mockRequest({ code: 'admin_code', state: 'test_state' });
    const response = await handler.GET(req);

    expect(response.status).toBe(302);
    expect(mockPrisma.prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'admin@example.com' },
        update: expect.objectContaining({ role: 'ADMIN' }),
        create: expect.objectContaining({ role: 'ADMIN' }),
      }),
    );
  });

  test('userinfo.is_admin=false 应降权 Prisma User.role=USER', async () => {
    mockOidcSession.getOAuthState.mockResolvedValueOnce('test_state');
    mockOidcSession.getCodeVerifier.mockResolvedValueOnce('test_verifier');
    mockOidcRp.exchangeCodeForToken.mockResolvedValueOnce({
      access_token: 't',
      refresh_token: 'r',
      token_type: 'Bearer',
      expires_in: 3600,
    });
    mockOidcRp.getUserInfo.mockResolvedValueOnce({
      sub: 'user_002',
      email: 'demoted@example.com',
      name: 'Demoted User',
      is_admin: false, // 明示 false（不是 undefined）
    });

    const req = mockRequest({ code: 'c', state: 'test_state' });
    await handler.GET(req);

    expect(mockPrisma.prisma.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ role: 'USER' }),
        create: expect.objectContaining({ role: 'USER' }),
      }),
    );
  });

  test('state 不匹配应重定向到错误页', async () => {
    mockOidcSession.getOAuthState.mockResolvedValueOnce('stored_state');

    const req = mockRequest({ code: 'auth_code', state: 'wrong_state' });
    const response = await handler.GET(req);

    expect(response.status).toBe(302);
    expect(response.url).toContain('error=state_mismatch');
    expect(mockOidcRp.exchangeCodeForToken).not.toHaveBeenCalled();
  });

  test('缺少 code_verifier 应重定向到错误页', async () => {
    mockOidcSession.getOAuthState.mockResolvedValueOnce('test_state');
    mockOidcSession.getCodeVerifier.mockResolvedValueOnce(undefined);

    const req = mockRequest({ code: 'auth_code', state: 'test_state' });
    const response = await handler.GET(req);

    expect(response.status).toBe(302);
    expect(response.url).toContain('error=missing_verifier');
    expect(mockOidcRp.exchangeCodeForToken).not.toHaveBeenCalled();
  });

  test('token 交换失败应返回错误', async () => {
    mockOidcSession.getOAuthState.mockResolvedValueOnce('test_state');
    mockOidcSession.getCodeVerifier.mockResolvedValueOnce('test_verifier');
    mockOidcRp.exchangeCodeForToken.mockRejectedValueOnce(
      new Error('[invalid_grant] Authorization code has expired')
    );

    const req = mockRequest({ code: 'expired_code', state: 'test_state' });
    const response = await handler.GET(req);

    expect(response.status).toBe(302);
    expect(response.url).toContain('error=callback_error');
  });

  test('IdP 返回 error 参数应短路处理', async () => {
    const req = mockRequest({ error: 'access_denied', error_description: 'User cancelled' });
    const response = await handler.GET(req);

    expect(response.status).toBe(302);
    expect(response.url).toContain('error=oidc_error');
    expect(mockOidcRp.exchangeCodeForToken).not.toHaveBeenCalled();
  });

  test('缺少 code 参数应重定向', async () => {
    const req = mockRequest({ state: 'test_state' });
    const response = await handler.GET(req);

    expect(response.status).toBe(302);
    expect(response.url).toContain('error=missing_code');
    expect(mockOidcRp.exchangeCodeForToken).not.toHaveBeenCalled();
  });
});

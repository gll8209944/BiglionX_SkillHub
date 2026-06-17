/**
 * oidc-rp.test.ts
 * 
 * NvwaX OIDC RP 客户端单元测试
 * 测试覆盖：PKCE 生成、Authorization URL、Token 换取、Refresh、UserInfo、
 * Logout、JWT 验证、错误路径
 */

import { jest } from '@jest/globals';

// Mock jose (ESM-only, intercept before any module loads it)
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(() => jest.fn()),
  base64url: {
    encode: jest.fn((input: Uint8Array) => {
      // Direct buffer encoding (avoid UTF-8 multi-byte issues)
      return Buffer.from(new Uint8Array(input)).toString('base64url');
    }),
    decode: jest.fn((input: string) => {
      return new TextEncoder().encode(Buffer.from(input, 'base64url').toString());
    }),
  },
}));


// Mock crypto.subtle (not available in jsdom)
const mockDigest = jest.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    },
    subtle: {
      digest: mockDigest,
    },
  },
  writable: true,
  configurable: true,
});

const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
global.fetch = mockFetch;

describe('oidc-rp', () => {
  let oidcRp: typeof import('@/lib/oidc-rp');

  beforeAll(async () => {
    process.env.SKILLHUB_OIDC_CLIENT_ID = 'test_client_id';
    process.env.SKILLHUB_OIDC_CLIENT_SECRET = 'test_client_secret';
    process.env.NEXT_PUBLIC_APP_URL = 'https://skillhub.proclaw.cc';
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup crypto.subtle.digest to return a deterministic 32-byte hash
    mockDigest.mockResolvedValue(new Uint8Array(32).buffer as ArrayBuffer);

    // Dynamic import to load the module with mocked dependencies
    const mod = await import('@/lib/oidc-rp');
    mod.resetJwksCache();
    oidcRp = mod;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ==========================================
  // PKCE 生成测试
  // ==========================================

  describe('generatePKCE', () => {
    test('应返回 codeVerifier 和 codeChallenge', async () => {
      const result = await oidcRp.generatePKCE();
      
      expect(result).toHaveProperty('codeVerifier');
      expect(result).toHaveProperty('codeChallenge');
      expect(typeof result.codeVerifier).toBe('string');
      expect(typeof result.codeChallenge).toBe('string');
    });

    test('codeVerifier 应在 43-128 字符范围内', async () => {
      const result = await oidcRp.generatePKCE();
      
      expect(result.codeVerifier.length).toBeGreaterThanOrEqual(43);
      expect(result.codeVerifier.length).toBeLessThanOrEqual(128);
    });

    test('codeVerifier 只应包含 [A-Za-z0-9-._~] 字符', async () => {
      const result = await oidcRp.generatePKCE();
      
      expect(result.codeVerifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
    });

    test('codeChallenge 应为有效的 base64url 字符串', async () => {
      const result = await oidcRp.generatePKCE();
      
      expect(result.codeChallenge).toMatch(/^[A-Za-z0-9\-_]+$/);
      expect(result.codeChallenge).not.toContain('=');
      expect(result.codeChallenge).not.toContain('+');
      expect(result.codeChallenge).not.toContain('/');
    });

    test('多次调用应生成不同的值', async () => {
      // Return different hashes for each call
      mockDigest
        .mockResolvedValueOnce(new Uint8Array([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]).buffer as ArrayBuffer)
        .mockResolvedValueOnce(new Uint8Array([32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]).buffer as ArrayBuffer);

      const [result1, result2] = await Promise.all([
        oidcRp.generatePKCE(),
        oidcRp.generatePKCE(),
      ]);
      
      expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
      expect(result1.codeChallenge).not.toBe(result2.codeChallenge);
    });

    test('codeChallenge 长度应为 43 字符（SHA-256 输出 32 字节 → base64url 43 字符）', async () => {
      const result = await oidcRp.generatePKCE();
      
      expect(result.codeChallenge.length).toBe(43);
    });
  });

  // ==========================================
  // Authorization URL 测试
  // ==========================================

  describe('getAuthorizationUrl', () => {
    test('应包含所有必需参数', () => {
      const state = 'test_state';
      const challenge = 'test_challenge';
      const url = oidcRp.getAuthorizationUrl(state, challenge);
      
      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe('https://account.proclaw.cc/oauth/authorize');
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.get('client_id')).toBe('test_client_id');
      expect(parsed.searchParams.get('redirect_uri')).toBe('https://skillhub.proclaw.cc/auth/callback');
      expect(parsed.searchParams.get('code_challenge')).toBe(challenge);
      expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
      expect(parsed.searchParams.get('state')).toBe(state);
      expect(parsed.searchParams.get('scope')).toBe('openid profile email');
    });

    test('应支持自定义 scope', () => {
      const url = oidcRp.getAuthorizationUrl('state', 'challenge', 'openid profile email admin');
      const parsed = new URL(url);
      expect(parsed.searchParams.get('scope')).toBe('openid profile email admin');
    });
  });

  // ==========================================
  // Token Exchange 测试
  // ==========================================

  describe('exchangeCodeForToken', () => {
    const mockTokenResponse = {
      access_token: 'new_access_token',
      refresh_token: 'new_refresh_token',
      id_token: 'header.eyJzdWIiOiJ1c2VyXzAwMSIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsIm5hbWUiOiJUZXN0IFVzZXIifQ.signature',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    test('成功换取 token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      const result = await oidcRp.exchangeCodeForToken('auth_code', 'verifier_string');

      expect(result.access_token).toBe('new_access_token');
      expect(result.refresh_token).toBe('new_refresh_token');
      expect(result.token_type).toBe('Bearer');
      expect(result.expires_in).toBe(3600);

      // 验证请求体（body.toString() 输出 URLSearchParams 格式）
      const body = mockFetch.mock.calls[0][1]?.body as string;
      expect(body).toContain('grant_type=authorization_code');
      expect(body).toContain('code=auth_code');
      expect(body).toContain('code_verifier=verifier_string');
      expect(body).toContain('client_id=test_client_id');
      expect(body).toContain('redirect_uri=https%3A%2F%2Fskillhub.proclaw.cc%2Fauth%2Fcallback');
    });

    test('应处理 invalid_grant 错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Authorization code has expired',
        }),
      } as Response);

      await expect(
        oidcRp.exchangeCodeForToken('expired_code', 'verifier')
      ).rejects.toThrow('invalid_grant');
    });

    test('应处理服务器错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({
          error: 'server_error',
          error_description: 'Internal error',
        }),
      } as Response);

      await expect(
        oidcRp.exchangeCodeForToken('code', 'verifier')
      ).rejects.toThrow('server_error');
    });

    test('应处理网络错误', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        oidcRp.exchangeCodeForToken('code', 'verifier')
      ).rejects.toThrow();
    });
  });

  // ==========================================
  // Refresh Token 测试
  // ==========================================

  describe('refreshAccessToken', () => {
    const mockRefreshResponse = {
      access_token: 'refreshed_access_token',
      refresh_token: 'new_refresh_token',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    test('成功续期 token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefreshResponse,
      } as Response);

      const result = await oidcRp.refreshAccessToken('old_refresh_token');

      expect(result.access_token).toBe('refreshed_access_token');
      
      const body = mockFetch.mock.calls[0][1]?.body as string;
      expect(body).toContain('grant_type=refresh_token');
      expect(body).toContain('refresh_token=old_refresh_token');
    });

    test('应处理 refresh_token 无效错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Refresh token is invalid or expired',
        }),
      } as Response);

      await expect(
        oidcRp.refreshAccessToken('invalid_refresh_token')
      ).rejects.toThrow('invalid_grant');
    });
  });

  // ==========================================
  // UserInfo 测试
  // ==========================================

  describe('getUserInfo', () => {
    test('成功获取用户信息', async () => {
      const mockUserInfo = {
        sub: 'user_001',
        email: 'user@example.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.png',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      } as Response);

      const result = await oidcRp.getUserInfo('valid_access_token');

      expect(result.sub).toBe('user_001');
      expect(result.email).toBe('user@example.com');
      expect(result.name).toBe('Test User');
      
      // 验证 Authorization header
      expect(mockFetch.mock.calls[0][1]?.headers).toMatchObject({
        Authorization: 'Bearer valid_access_token',
      });
    });

    test('应处理 401 错误', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: 'invalid_token',
          error_description: 'Access token expired',
        }),
      } as Response);

      await expect(
        oidcRp.getUserInfo('expired_token')
      ).rejects.toThrow('invalid_token');
    });
  });

  // ==========================================
  // Logout 测试
  // ==========================================

  describe('logout', () => {
    test('成功撤销 refresh_token', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await expect(
        oidcRp.logout('refresh_token_to_revoke')
      ).resolves.not.toThrow();
    });

    test('网络错误不应抛出（尽力而为）', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        oidcRp.logout('refresh_token')
      ).resolves.not.toThrow();
    });

    test('服务器错误不应抛出（尽力而为）', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'server_error' }),
      } as Response);

      await expect(
        oidcRp.logout('refresh_token')
      ).resolves.not.toThrow();
    });
  });

  // ==========================================
  // JWT 验证测试
  // ==========================================

  describe('verifyAccessToken', () => {
    test('成功验证 access_token 并返回 claims（含 is_admin）', async () => {
      const mockPayload = {
        sub: 'user_001',
        email: 'admin@example.com',
        name: 'Admin User',
        is_admin: true,
        scope: 'openid profile email',
        iss: 'https://account.proclaw.cc',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      // Get the mocked jwtVerify
      const { jwtVerify } = jest.requireMock('jose') as { jwtVerify: jest.Mock };
      jwtVerify.mockResolvedValueOnce({
        payload: mockPayload,
        protectedHeader: { alg: 'RS256' },
      });

      const result = await oidcRp.verifyAccessToken('valid.jwt.token');

      expect(result.sub).toBe('user_001');
      expect(result.email).toBe('admin@example.com');
      expect(result.is_admin).toBe(true);
      expect(result.scope).toBe('openid profile email');
    });

    test('应处理过期 token', async () => {
      const { jwtVerify } = jest.requireMock('jose') as { jwtVerify: jest.Mock };
      jwtVerify.mockRejectedValueOnce(
        Object.assign(new Error('jwt expired'), { code: 'ERR_JWT_EXPIRED' })
      );

      await expect(
        oidcRp.verifyAccessToken('expired.jwt.token')
      ).rejects.toThrow('invalid_grant');
    });

    test('应处理签名无效', async () => {
      const { jwtVerify } = jest.requireMock('jose') as { jwtVerify: jest.Mock };
      jwtVerify.mockRejectedValueOnce(
        new Error('signature verification failed')
      );

      await expect(
        oidcRp.verifyAccessToken('bad.signature.token')
      ).rejects.toThrow('server_error');
    });
  });
});

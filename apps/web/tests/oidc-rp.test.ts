/**
 * oidc-rp.test.ts
 *
 * NvwaX OIDC Public Client RP 单元测试
 * 覆盖：PKCE 生成、Authorization URL（discovery 驱动）、Token 换取/续期（无 secret）、
 * UserInfo、Logout（JSON body）、JWT 验证（含 audience 校验）
 *
 * 关键断言：public client 模式下，token / refresh / logout 请求体**不得**包含 client_secret
 */

import { jest } from '@jest/globals';

// ============================================================
// Mock jose
// ============================================================
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(() => jest.fn()),
  base64url: {
    encode: jest.fn((input: Uint8Array) => {
      return Buffer.from(new Uint8Array(input)).toString('base64url');
    }),
    decode: jest.fn((input: string) => {
      return new TextEncoder().encode(Buffer.from(input, 'base64url').toString());
    }),
  },
}));

// ============================================================
// Mock crypto.subtle
// ============================================================
const mockDigest = jest.fn();
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    },
    subtle: { digest: mockDigest },
  },
  writable: true,
  configurable: true,
});

const DISCOVERY_DOC = {
  issuer: 'https://account.proclaw.cc',
  authorization_endpoint: 'https://account.proclaw.cc/oauth/authorize',
  token_endpoint: 'https://account.proclaw.cc/oauth/token',
  userinfo_endpoint: 'https://account.proclaw.cc/oauth/userinfo',
  end_session_endpoint: 'https://account.proclaw.cc/oauth/logout',
  jwks_uri: 'https://account.proclaw.cc/.well-known/jwks.json',
  token_endpoint_auth_methods_supported: ['none', 'client_secret_post'],
};

const mockFetch = jest.fn() as jest.MockedFunction<typeof global.fetch>;
global.fetch = mockFetch;

describe('oidc-rp（Public Client）', () => {
  let oidcRp: typeof import('@/lib/oidc-rp');
  let oidcDiscovery: typeof import('@/lib/oidc-discovery');

  beforeAll(() => {
    process.env.SKILLHUB_OIDC_CLIENT_ID = 'test_client_id';
    process.env.SKILLHUB_OIDC_DISCOVERY_URL = 'https://account.proclaw.cc/.well-known/openid-configuration';
    process.env.NEXT_PUBLIC_APP_URL = 'https://skillhub.proclaw.cc';
  });

  beforeEach(async () => {
    // 只清空 mock 调用记录，保留默认实现（如 jose.createRemoteJWKSet）
    jest.clearAllMocks();
    mockDigest.mockResolvedValue(new Uint8Array(32).buffer as ArrayBuffer);

    // 加载模块
    oidcRp = await import('@/lib/oidc-rp');
    oidcDiscovery = await import('@/lib/oidc-discovery');
    oidcRp.resetAllCaches();
    oidcDiscovery.resetDiscoveryCache();
  });

  /** 快捷工具：mock discovery 响应（消费 1 个 fetch） */
  const mockDiscovery = () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => DISCOVERY_DOC,
    } as Response);
  };

  // ==========================================
  // PKCE
  // ==========================================
  describe('generatePKCE', () => {
    test('应返回 codeVerifier 和 codeChallenge', async () => {
      const result = await oidcRp.generatePKCE();
      expect(result).toHaveProperty('codeVerifier');
      expect(result).toHaveProperty('codeChallenge');
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

    test('codeChallenge 应为有效 base64url（无 padding，43 字符）', async () => {
      const result = await oidcRp.generatePKCE();
      expect(result.codeChallenge).toMatch(/^[A-Za-z0-9\-_]+$/);
      expect(result.codeChallenge.length).toBe(43);
      expect(result.codeChallenge).not.toContain('=');
    });

    test('多次调用应生成不同值', async () => {
      mockDigest
        .mockResolvedValueOnce(new Uint8Array(32).buffer as ArrayBuffer)
        .mockResolvedValueOnce(new Uint8Array(32).buffer as ArrayBuffer);
      const [a, b] = await Promise.all([oidcRp.generatePKCE(), oidcRp.generatePKCE()]);
      expect(a.codeVerifier).not.toBe(b.codeVerifier);
    });
  });

  // ==========================================
  // Authorization URL
  // ==========================================
  describe('getAuthorizationUrl', () => {
    test('端点应来自 discovery 而非硬编码', async () => {
      mockDiscovery();
      const url = await oidcRp.getAuthorizationUrl('test_state', 'test_challenge');
      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe('https://account.proclaw.cc/oauth/authorize');
    });

    test('应包含 PKCE S256 必需参数', async () => {
      mockDiscovery();
      const url = await oidcRp.getAuthorizationUrl('test_state', 'test_challenge');
      const parsed = new URL(url);
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.get('client_id')).toBe('test_client_id');
      expect(parsed.searchParams.get('redirect_uri')).toBe('https://skillhub.proclaw.cc/auth/callback');
      expect(parsed.searchParams.get('code_challenge')).toBe('test_challenge');
      expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
      expect(parsed.searchParams.get('state')).toBe('test_state');
      expect(parsed.searchParams.get('scope')).toBe('openid profile email');
    });

    test('应支持自定义 scope', async () => {
      mockDiscovery();
      const url = await oidcRp.getAuthorizationUrl('s', 'c', 'openid profile email admin');
      const parsed = new URL(url);
      expect(parsed.searchParams.get('scope')).toBe('openid profile email admin');
    });

    test('未配置 env 时 clientId 应回退到默认值 "skillhub-web"', async () => {
      const savedId = process.env.SKILLHUB_OIDC_CLIENT_ID;
      delete process.env.SKILLHUB_OIDC_CLIENT_ID;
      try {
        mockDiscovery();
        const url = await oidcRp.getAuthorizationUrl('s', 'c');
        const parsed = new URL(url);
        expect(parsed.searchParams.get('client_id')).toBe('skillhub-web');
      } finally {
        process.env.SKILLHUB_OIDC_CLIENT_ID = savedId;
      }
    });
  });

  // ==========================================
  // Token Exchange（PUBLIC CLIENT：不含 client_secret）
  // ==========================================
  describe('exchangeCodeForToken', () => {
    const mockTokenResponse = {
      access_token: 'new_access',
      refresh_token: 'new_refresh',
      id_token: 'h.p.s',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    test('成功换取 token', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      const result = await oidcRp.exchangeCodeForToken('auth_code', 'verifier');
      expect(result.access_token).toBe('new_access');

      // 第二个 fetch 是 token 端点
      const body = mockFetch.mock.calls[1][1]?.body as string;
      expect(body).toContain('grant_type=authorization_code');
      expect(body).toContain('code=auth_code');
      expect(body).toContain('code_verifier=verifier');
      expect(body).toContain('client_id=test_client_id');
    });

    test('请求体【不应】包含 client_secret（public client 关键约束）', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      } as Response);

      await oidcRp.exchangeCodeForToken('code', 'verifier');
      const body = mockFetch.mock.calls[1][1]?.body as string;
      expect(body).not.toContain('client_secret=');
    });

    test('应处理 invalid_grant', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'invalid_grant', error_description: 'Code expired' }),
      } as Response);

      await expect(oidcRp.exchangeCodeForToken('expired', 'v')).rejects.toThrow('invalid_grant');
    });

    test('应处理 server_error', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'server_error' }),
      } as Response);

      await expect(oidcRp.exchangeCodeForToken('c', 'v')).rejects.toThrow('server_error');
    });
  });

  // ==========================================
  // Refresh Token（链式轮换，public client）
  // ==========================================
  describe('refreshAccessToken', () => {
    const mockRefreshResponse = {
      access_token: 'refreshed_access',
      refresh_token: 'new_refresh',
      token_type: 'Bearer',
      expires_in: 3600,
    };

    test('成功续期 token', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefreshResponse,
      } as Response);

      const result = await oidcRp.refreshAccessToken('old_refresh');
      expect(result.access_token).toBe('refreshed_access');

      const body = mockFetch.mock.calls[1][1]?.body as string;
      expect(body).toContain('grant_type=refresh_token');
      expect(body).toContain('refresh_token=old_refresh');
      expect(body).toContain('client_id=test_client_id');
    });

    test('请求体【不应】包含 client_secret', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRefreshResponse,
      } as Response);

      await oidcRp.refreshAccessToken('r');
      const body = mockFetch.mock.calls[1][1]?.body as string;
      expect(body).not.toContain('client_secret=');
    });

    test('refresh_token 失效应抛 invalid_grant', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'invalid_grant' }),
      } as Response);

      await expect(oidcRp.refreshAccessToken('bad')).rejects.toThrow('invalid_grant');
    });
  });

  // ==========================================
  // UserInfo
  // ==========================================
  describe('getUserInfo', () => {
    test('成功获取 userinfo（含 is_admin）', async () => {
      const mockUserInfo = {
        sub: 'user_001',
        email: 'admin@example.com',
        name: 'Admin',
        picture: 'https://example.com/avatar.png',
        is_admin: true,
      };
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserInfo,
      } as Response);

      const result = await oidcRp.getUserInfo('valid_token');
      expect(result.sub).toBe('user_001');
      expect(result.is_admin).toBe(true);
      expect(mockFetch.mock.calls[1][1]?.headers).toMatchObject({
        Authorization: 'Bearer valid_token',
      });
    });

    test('应处理 401', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'invalid_token' }),
      } as Response);

      await expect(oidcRp.getUserInfo('expired')).rejects.toThrow('invalid_token');
    });
  });

  // ==========================================
  // Logout（JSON body，不带 client_secret）
  // ==========================================
  describe('logout', () => {
    test('应使用 JSON body 撤销 refresh_token', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

      await oidcRp.logout('refresh_to_revoke');

      const callArgs = mockFetch.mock.calls[1];
      const init = callArgs[1] as RequestInit;
      expect(init.method).toBe('POST');
      expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
      const body = JSON.parse(init.body as string);
      expect(body).toEqual({ refresh_token: 'refresh_to_revoke' });
    });

    test('请求体【不应】包含 client_secret 或 client_id', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

      await oidcRp.logout('r');
      const init = mockFetch.mock.calls[1][1] as RequestInit;
      const body = JSON.parse(init.body as string);
      expect(body).not.toHaveProperty('client_secret');
      expect(body).not.toHaveProperty('client_id');
    });

    test('网络错误不应抛出（尽力而为）', async () => {
      mockDiscovery();
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(oidcRp.logout('r')).resolves.not.toThrow();
    });

    test('服务器错误不应抛出', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) } as Response);

      await expect(oidcRp.logout('r')).resolves.not.toThrow();
    });
  });

  // ==========================================
  // JWT Verification
  // ==========================================
  describe('verifyAccessToken', () => {
    test('成功验证 access_token（包含 is_admin claim）', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => DISCOVERY_DOC } as Response); // discovery 重新拉取

      const mockPayload = {
        sub: 'user_001',
        email: 'admin@example.com',
        name: 'Admin',
        is_admin: true,
        scope: 'openid profile email',
        iss: 'https://account.proclaw.cc',
        aud: 'test_client_id',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };
      const { jwtVerify } = jest.requireMock('jose') as { jwtVerify: jest.Mock };
      jwtVerify.mockResolvedValueOnce({
        payload: mockPayload,
        protectedHeader: { alg: 'RS256' },
      });

      // 首次 verifyAccessToken：reset jwks cache 让它拉一次
      // 实际上 jwks cache 已经在 resetAllCaches 中清空，但 discovery 已在 beforeEach 后被 useAuthorizationUrl 加载过？不一定
      // 简化：直接测试 mock jose 返回值
      const result = await oidcRp.verifyAccessToken('valid.jwt.token');
      expect(result.sub).toBe('user_001');
      expect(result.is_admin).toBe(true);
    });

    test('应向 jose 传入正确的 issuer 和 audience 约束', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => DISCOVERY_DOC } as Response);

      const { jwtVerify } = jest.requireMock('jose') as { jwtVerify: jest.Mock };
      jwtVerify.mockResolvedValueOnce({
        payload: { sub: 'u1', iss: 'https://account.proclaw.cc', aud: 'test_client_id' },
        protectedHeader: { alg: 'RS256' },
      });

      await oidcRp.verifyAccessToken('t');
      expect(jwtVerify).toHaveBeenCalledWith(
        't',
        expect.anything(),
        expect.objectContaining({
          issuer: 'https://account.proclaw.cc',
          audience: 'test_client_id',
          algorithms: ['RS256'],
        }),
      );
    });

    test('应处理过期 token', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => DISCOVERY_DOC } as Response);

      const { jwtVerify } = jest.requireMock('jose') as { jwtVerify: jest.Mock };
      jwtVerify.mockRejectedValueOnce(
        Object.assign(new Error('jwt expired'), { code: 'ERR_JWT_EXPIRED' }),
      );
      await expect(oidcRp.verifyAccessToken('expired')).rejects.toThrow('invalid_grant');
    });

    test('应处理签名无效', async () => {
      mockDiscovery();
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => DISCOVERY_DOC } as Response);

      const { jwtVerify } = jest.requireMock('jose') as { jwtVerify: jest.Mock };
      jwtVerify.mockRejectedValueOnce(new Error('signature verification failed'));
      await expect(oidcRp.verifyAccessToken('bad')).rejects.toThrow('server_error');
    });
  });
});

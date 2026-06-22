import { getAppBaseUrl, appUrl } from '@/lib/app-url';

describe('app-url', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXTAUTH_URL;
    delete process.env.APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('优先使用 NEXTAUTH_URL（运行时 ECS 配置）', () => {
    process.env.NEXTAUTH_URL = 'http://8.136.122.123:3000';
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
    expect(getAppBaseUrl()).toBe('http://8.136.122.123:3000');
  });

  it('构造 OAuth 回调绝对地址', () => {
    process.env.NEXTAUTH_URL = 'http://8.136.122.123:3000';
    expect(appUrl('/login?error=state_mismatch').toString()).toBe(
      'http://8.136.122.123:3000/login?error=state_mismatch',
    );
  });
});

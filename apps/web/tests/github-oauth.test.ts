import { getGitHubAuthUrl } from '@/lib/providers/github';

describe('GitHub OAuth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GITHUB_CLIENT_ID: 'test-client-id',
      NEXTAUTH_URL: 'http://8.136.122.123:3000',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('redirect_uri 使用 NEXTAUTH_URL 而非构建时固化的 NEXT_PUBLIC_APP_URL', () => {
    const url = new URL(getGitHubAuthUrl('test-state'));
    expect(url.searchParams.get('redirect_uri')).toBe(
      'http://8.136.122.123:3000/oauth/callback?provider=github',
    );
  });
});

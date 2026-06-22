/**
 * 应用对外基址 URL（服务端使用）。
 *
 * OAuth redirect_uri、错误页重定向等必须在运行时读取 NEXTAUTH_URL，
 * 不能仅依赖 next build 时固化的 NEXT_PUBLIC_*。
 */
export function getAppBaseUrl(): string {
  const url =
    process.env.NEXTAUTH_URL ||
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  return url.replace(/\/$/, '');
}

/** 基于应用基址构造绝对 URL（用于 Route Handler 重定向） */
export function appUrl(path: string): URL {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, `${getAppBaseUrl()}/`);
}

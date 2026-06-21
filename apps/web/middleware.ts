import { NextResponse, type NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/oidc-rp';
import { verifySessionToken } from '@/lib/providers/session-jwt';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ==========================================
  // 安全响应头配置
  // ==========================================
  
  // 防止点击劫持
  response.headers.set('X-Frame-Options', 'DENY');
  
  // 防止 MIME 类型嗅探
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // XSS 保护
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // 引用策略
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 内容安全策略 (CSP)
  const isDev = process.env.NODE_ENV === 'development';
  const connectSrc = isDev 
    ? "connect-src 'self' http://localhost:* ws://localhost:* https://*.googleapis.com; "
    : "connect-src 'self' https://*.googleapis.com; ";
  
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    connectSrc +
    "frame-ancestors 'none';"
  );
  
  // 权限策略
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  // HSTS (仅在 HTTPS 环境下)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // ==========================================
  // 认证检查（仅对特定路由）
  // ==========================================
  const protectedPaths = [
    '/dashboard',
    '/api/skills/publish',
    '/api/namespaces',
  ];

  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const accessToken = request.cookies.get('skillhub_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.redirect(
        new URL('/auth/login', request.url)
      );
    }

    // 1. 先尝试自签 HS256 验证（本地计算，<1ms）
    const sessionPayload = await verifySessionToken(accessToken);
    if (sessionPayload) {
      // 自签 JWT 验证通过，请求继续
      return response;
    }

    // 2. 尝试 NvwaX RS256 验证（可能需要 JWKS 网络请求）
    try {
      await verifyAccessToken(accessToken);
      // NvwaX JWT 验证通过，请求继续
      return response;
    } catch {
      // 不是 NvwaX JWT
    }

    // 3. 两种验证都失败，重定向到登录页
    return NextResponse.redirect(
      new URL('/auth/login', request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',     // 用户仪表板 - 需要登录
    '/api/skills/publish',   // 发布技能 API - 需要登录
    '/api/namespaces/:path*', // 命名空间管理 API - 需要登录
    // 注意：/skills 和 /namespaces 浏览页面是公开的，不需要登录
  ],
};

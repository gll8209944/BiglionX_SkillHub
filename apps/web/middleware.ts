import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
  // 注意：根据实际需求调整 CSP 策略
  // 开发环境允许 localhost 的所有端口，生产环境限制更严格
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
    // 使用 getToken 代替 auth()，因为 middleware 运行在 Edge Runtime
    // getToken 只验证 JWT token，不需要访问数据库
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    if (!token) {
      return NextResponse.redirect(
        new URL('/login', process.env.NEXTAUTH_URL || 'http://localhost:3000')
      );
    }
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

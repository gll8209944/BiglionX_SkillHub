import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisCache } from '@/lib/redis-vercel';

// 强制动态渲染，避免构建时尝试连接外部服务
export const dynamic = 'force-dynamic';

/**
 * 健康检查端点
 * 用于监控服务状态和依赖项健康情况
 */
export async function GET() {
  const startTime = Date.now();
  
  interface HealthCheck {
    status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown';
    responseTime: number | null;
    error: string | null;
  }

  interface HealthResponse {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    uptime: number;
    version: string;
    checks: {
      database: HealthCheck;
      redis: HealthCheck;
      totalResponseTime: number | null;
    };
  }

  const health: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: {
        status: 'unknown',
        responseTime: null,
        error: null,
      },
      redis: {
        status: 'unknown',
        responseTime: null,
        error: null,
      },
      totalResponseTime: null,
    },
  };

  // 检查数据库连接（带重试，支持 Neon 唤醒）
  try {
    const dbStart = Date.now();
    let dbConnected = false;
    for (let i = 0; i < 3 && !dbConnected; i++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        dbConnected = true;
      } catch {
        if (i < 2) {
          // 等待后重试，给 Neon 唤醒时间
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    }
    const dbResponseTime = Date.now() - dbStart;
    
    health.checks.database.status = dbConnected ? 'healthy' : 'unhealthy';
    health.checks.database.responseTime = dbResponseTime;
    if (!dbConnected) {
      health.checks.database.error = 'Failed to connect after 3 retries';
      health.status = 'degraded';
    }
  } catch (error) {
    health.checks.database.status = 'unhealthy';
    health.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    health.status = 'degraded';
  }

  // 检查 Redis 连接
  try {
    const redisStart = Date.now();
    await redisCache.get('health_check');
    const redisResponseTime = Date.now() - redisStart;
    
    health.checks.redis.status = 'healthy';
    health.checks.redis.responseTime = redisResponseTime;
  } catch (error) {
    health.checks.redis.status = 'unhealthy';
    health.checks.redis.error = error instanceof Error ? error.message : 'Unknown error';
    health.status = 'degraded';
  }

  // 计算总响应时间
  health.checks.totalResponseTime = Date.now() - startTime;

  // 如果任何关键服务不健康，返回 503
  const isHealthy = 
    health.checks.database.status === 'healthy' &&
    health.checks.redis.status === 'healthy';

  const statusCode = isHealthy ? 200 : 503;
  if (!isHealthy) {
    health.status = 'unhealthy';
  }

  return NextResponse.json(health, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}

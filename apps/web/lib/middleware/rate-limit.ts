/**
 * RateLimiter - API 速率限制中间件
 * 基于 Upstash Redis 实现
 */
import { Redis } from '@upstash/redis';

// 初始化 Upstash Redis（如果环境变量存在）
function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    return new Redis({ url, token });
  }
  return null;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

export class RateLimiter {
  private redis: Redis | null = null;
  private readonly WINDOW_SECONDS = 60; // 1 分钟窗口

  constructor() {
    this.redis = getRedis();
  }

  /**
   * 检查速率限制
   * @param identifier - 用户标识（IP 或 API Key ID）
   * @param isAuthenticated - 是否已认证
   */
  async check(identifier: string, isAuthenticated: boolean): Promise<RateLimitResult> {
    const limit = isAuthenticated ? 1000 : 100; // 认证用户 1000次/分钟，普通用户 100次/分钟

    // 如果没有 Redis 配置，跳过限流
    if (!this.redis) {
      return { allowed: true, remaining: limit, reset: Math.floor(Date.now() / 1000) + this.WINDOW_SECONDS, limit };
    }

    const key = `ratelimit:v2:${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - (now % this.WINDOW_SECONDS);

    try {
      const current = await this.redis.get<number>(key);

      if (current === null || current === undefined) {
        // 新窗口，设置初始值
        await this.redis.setex(key, this.WINDOW_SECONDS, 1);
        return { allowed: true, remaining: limit - 1, reset: windowStart + this.WINDOW_SECONDS, limit };
      }

      if (current >= limit) {
        return { allowed: false, remaining: 0, reset: windowStart + this.WINDOW_SECONDS, limit };
      }

      // 递增计数
      await this.redis.incr(key);
      return { allowed: true, remaining: limit - current - 1, reset: windowStart + this.WINDOW_SECONDS, limit };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // 限流服务异常时放行请求
      return { allowed: true, remaining: limit, reset: windowStart + this.WINDOW_SECONDS, limit };
    }
  }

  /**
   * 从请求中提取限流标识
   */
  getIdentifier(request: Request, userId?: string): string {
    if (userId) return `user:${userId}`;
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) return `ip:${forwarded.split(',')[0].trim()}`;
    return `ip:unknown`;
  }
}

export const rateLimiter = new RateLimiter();

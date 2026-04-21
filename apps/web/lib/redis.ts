import { createClient, RedisClientType } from 'redis';

class RedisCache {
  private client: RedisClientType | null = null;
  private static instance: RedisCache;

  private constructor() {}

  public static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  public async connect(): Promise<void> {
    if (this.client) return;

    // 在 Vercel 环境中使用 Upstash Redis
    const isVercel = process.env.VERCEL === '1';
    let redisUrl: string;
    
    if (isVercel && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      // 使用 Upstash Redis (HTTP API)
      console.log('🔧 Using Upstash Redis for Vercel');
      // 对于 Upstash，我们需要使用特殊的 URL 格式
      redisUrl = `${process.env.UPSTASH_REDIS_REST_URL}?token=${process.env.UPSTASH_REDIS_REST_TOKEN}`;
    } else {
      // 本地开发使用传统 Redis
      redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    }
    
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    await this.client.connect();
    console.log('Connected to Redis');
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  public async get(key: string): Promise<any> {
    if (!this.client) await this.connect();
    
    const value = await this.client!.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.client) await this.connect();

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    if (ttl) {
      await this.client!.setEx(key, ttl, stringValue);
    } else {
      await this.client!.set(key, stringValue);
    }
  }

  public async del(key: string): Promise<void> {
    if (!this.client) await this.connect();
    await this.client!.del(key);
  }

  public async flush(): Promise<void> {
    if (!this.client) await this.connect();
    await this.client!.flushAll();
  }
}

export const redisCache = RedisCache.getInstance();

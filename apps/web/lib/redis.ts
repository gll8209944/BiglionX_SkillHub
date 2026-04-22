import { createClient, RedisClientType } from 'redis';

// 检测是否在 Vercel 环境
const isVercel = process.env.VERCEL === '1';

// 在 Vercel 环境中使用 Upstash Redis
let upstashRedis: any = null;
if (isVercel && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const { Redis } = require('@upstash/redis');
    upstashRedis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('✅ Upstash Redis initialized for Vercel');
  } catch (error) {
    console.error('❌ Failed to initialize Upstash Redis:', error);
  }
}

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
    
    // 如果在 Vercel 环境且 Upstash 已初始化，直接使用
    if (isVercel && upstashRedis) {
      console.log('🔧 Using Upstash Redis for Vercel');
      return;
    }

    // 本地开发使用传统 Redis
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = createClient({ url: redisUrl });

    this.client.on('error', (err) => {
      console.error('⚠️ Redis Client Error:', err.message);
    });

    try {
      await this.client.connect();
      console.log('✅ Connected to Redis');
    } catch {
      console.error('❌ Redis connection failed, will use memory cache only');
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  public async get(key: string): Promise<unknown> {
    // 如果在 Vercel 环境且 Upstash 已初始化，使用 Upstash
    if (isVercel && upstashRedis) {
      try {
        const value = await upstashRedis.get(key);
        if (!value) return null;
        
        try {
          return JSON.parse(value as string);
        } catch {
          return value;
        }
      } catch (error) {
        console.error('⚠️ Upstash GET error:', error instanceof Error ? error.message : 'Unknown error');
        return null;
      }
    }
    
    if (!this.client) await this.connect();
    
    const client = this.client;
    if (!client) return null;

    try {
      const value = await client.get(key);
      if (!value) return null;

      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('⚠️ Redis GET error:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }

  public async set(key: string, value: unknown, ttl?: number): Promise<void> {
    // 如果在 Vercel 环境且 Upstash 已初始化，使用 Upstash
    if (isVercel && upstashRedis) {
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttl) {
          await upstashRedis.setex(key, ttl, stringValue);
        } else {
          await upstashRedis.set(key, stringValue);
        }
      } catch (error) {
        console.error('⚠️ Upstash SET error:', error instanceof Error ? error.message : 'Unknown error');
      }
      return;
    }
    
    if (!this.client) await this.connect();

    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    const client = this.client;
    if (!client) return;

    try {
      if (ttl) {
        await client.setEx(key, ttl, stringValue);
      } else {
        await client.set(key, stringValue);
      }
    } catch (error) {
      console.error('⚠️ Redis SET error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  public async del(key: string): Promise<void> {
    // 如果在 Vercel 环境且 Upstash 已初始化，使用 Upstash
    if (isVercel && upstashRedis) {
      try {
        await upstashRedis.del(key);
      } catch (error) {
        console.error('⚠️ Upstash DEL error:', error instanceof Error ? error.message : 'Unknown error');
      }
      return;
    }
    
    if (!this.client) await this.connect();
    const client = this.client;
    if (!client) return;
    
    try {
      await client.del(key);
    } catch (error) {
      console.error('⚠️ Redis DEL error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  public async flush(): Promise<void> {
    if (!this.client) await this.connect();
    const client = this.client;
    if (!client) return;
    await client.flushAll();
  }
}

export const redisCache = RedisCache.getInstance();

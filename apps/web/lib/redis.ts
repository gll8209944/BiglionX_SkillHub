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

    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
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

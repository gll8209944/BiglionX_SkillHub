/**
 * Redis 客户端配置
 * 支持本地 Redis 和 Vercel + Upstash
 */

// 检测是否在 Vercel 环境
const isVercel = process.env.VERCEL === '1';

let redisCache: any;

if (isVercel) {
  // Vercel 环境：使用 Upstash HTTP API（需要安装 @upstash/redis）
  console.log('🔧 Using Upstash Redis for Vercel');
  
  try {
    const { Redis } = require('@upstash/redis');
    
    redisCache = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || '',
      token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    });
    
    // 包装方法以兼容现有代码
    const originalRedis = redisCache;
    redisCache = {
      async get(key: string) {
        return await originalRedis.get(key);
      },
      async set(key: string, value: any, ttl?: number) {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        if (ttl) {
          await originalRedis.setex(key, ttl, stringValue);
        } else {
          await originalRedis.set(key, stringValue);
        }
      },
      async del(key: string) {
        await originalRedis.del(key);
      },
      async connect() {
        // Upstash 不需要显式连接
        console.log('✅ Upstash Redis ready');
      },
      async disconnect() {
        // Upstash 不需要显式断开
      },
    };
  } catch (error) {
    console.error('❌ Failed to initialize Upstash Redis:', error);
    console.warn('⚠️ 请安装 @upstash/redis: npm install @upstash/redis');
    throw error;
  }
} else {
  // 本地环境：使用传统 Redis
  console.log('🔧 Using local Redis');
  
  const { createClient } = require('redis');
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });
  
  client.on('error', (err: any) => {
    console.error('❌ Redis Client Error:', err);
  });
  
  client.on('connect', () => {
    console.log('✅ Connected to Redis');
  });
  
  // 自动连接（不等待）
  client.connect().catch(console.error);
  
  redisCache = {
    async get(key: string) {
      const value = await client.get(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    },
    async set(key: string, value: any, ttl?: number) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      if (ttl) {
        await client.setEx(key, ttl, stringValue);
      } else {
        await client.set(key, stringValue);
      }
    },
    async del(key: string) {
      await client.del(key);
    },
    async connect() {
      if (!client.isOpen) {
        await client.connect();
      }
    },
    async disconnect() {
      if (client.isOpen) {
        await client.disconnect();
      }
    },
  };
}

export { redisCache };

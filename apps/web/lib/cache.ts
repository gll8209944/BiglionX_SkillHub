import { NextRequest, NextResponse } from 'next/server';
import { redisCache } from './redis';

type HandlerFunction = (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>;

export function withCache(handler: HandlerFunction, ttl = 300) {
  return async function cachedHandler(request: NextRequest, ...args: unknown[]) {
    const cacheKey = `cache:${request.url}`;

    try {
      // Try to get from cache
      const cachedData = await redisCache.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT: ${cacheKey}`);
        return NextResponse.json(cachedData, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': `public, max-age=${ttl}`,
          },
        });
      }

      console.log(`Cache MISS: ${cacheKey}`);

      // Execute handler
      const response = await handler(request, ...args);
      
      // Clone response to read body
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();

      // Store in cache
      await redisCache.set(cacheKey, data, ttl);

      // Return response with cache headers
      return NextResponse.json(data, {
        status: response.status,
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${ttl}`,
        },
      });
    } catch (error) {
      console.error('Cache error:', error);
      // If cache fails, still execute handler
      return handler(request, ...args);
    }
  };
}

export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const keys = await redisCache.get(`keys:${pattern}*`);
    if (keys && Array.isArray(keys)) {
      for (const key of keys) {
        await redisCache.del(key);
      }
    }
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
  }
}

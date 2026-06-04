import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Neon 连接优化：
// - connection_limit=1: Neon 免费套餐限制为 1
// - pool_timeout=10: 连接池等待超时 10 秒（给 Neon 足够唤醒时间）
// 注意：不设置 connect_timeout，让 Prisma 等待 Neon 自然唤醒（通常 1-5 秒）
const baseUrl = process.env.DATABASE_URL || '';
const timeoutParams = baseUrl.includes('?') ? '&' : '?';
const optimizedUrl = `${baseUrl}${timeoutParams}connection_limit=1&pool_timeout=10`;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: optimizedUrl,
    },
  },
});

// 添加连接错误处理和自动重连逻辑
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma as any).$on('error', (e: { message: string }) => {
    // Neon 空闲连接超时是正常现象，只记录不抛出
    if (e.message.includes('terminating connection')) {
      console.log('⚠️  Neon 连接重置（正常现象，将自动重连）');
    } else if (e.message.includes('connection timed out')) {
      console.log('⏰ 连接超时，Neon 可能正在唤醒...');
    } else {
      console.error('Prisma error:', e);
    }
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Force TypeScript to reload types
export type { PrismaClient };

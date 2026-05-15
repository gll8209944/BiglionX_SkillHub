import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // 添加连接超时和重试配置
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Neon 数据库优化配置
  // connection_limit: Neon 免费套餐限制为 1
  // pool_timeout: 等待连接的超时时间（秒）
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

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
});

// 添加连接错误处理
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (prisma as any).$on('error', (e: { message: string }) => {
    // Neon 空闲连接超时是正常现象，只记录不抛出
    if (e.message.includes('terminating connection')) {
      console.log('⚠️  Neon 连接重置（正常现象，将自动重连）');
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

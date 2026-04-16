import { PrismaClient } from '@prisma/client';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// 配置 Neon WebSocket
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 创建连接池（使用环境变量中的 DATABASE_URL）
const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });

// 创建 Prisma Neon 适配器
const adapter = new PrismaNeon(pool as any);

// 创建 Prisma Client 实例
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

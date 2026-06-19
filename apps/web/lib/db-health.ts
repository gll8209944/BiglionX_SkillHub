import { prisma } from './prisma';

/**
 * 检查数据库连接状态并尝试唤醒 Neon 数据库
 * 
 * Neon 数据库在闲置后会进入休眠状态，首次连接可能需要 1-5 秒唤醒时间
 * 此函数会尝试建立连接并在失败时重试
 */
export async function ensureDatabaseConnection(maxRetries = 3, retryDelay = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 尝试执行一个简单的查询来测试连接
      await prisma.$queryRaw`SELECT 1`;
      
      if (attempt > 1) {
        console.log(`✅ 数据库连接成功（第 ${attempt} 次尝试）`);
      }
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // 判断是否是连接超时错误（Neon 正在唤醒）
      if (errorMessage.includes('connection timed out') || 
          errorMessage.includes('terminating connection') ||
          errorMessage.includes('Connection terminated unexpectedly')) {
        
        if (attempt < maxRetries) {
          console.log(`⏰ 数据库连接超时（尝试 ${attempt}/${maxRetries}），Neon 可能正在唤醒...`);
          console.log(`   等待 ${retryDelay / 1000} 秒后重试...`);
          
          // 等待后重试
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          console.error(`❌ 数据库连接失败（已尝试 ${maxRetries} 次）`);
          console.error(`   错误信息: ${errorMessage}`);
          console.error(`   请检查:`);
          console.error(`   1. DATABASE_URL 环境变量是否正确配置`);
          console.error(`   2. Neon 数据库是否处于活跃状态`);
          console.error(`   3. 网络连接是否正常`);
        }
      } else {
        // 其他类型的错误，直接抛出
        console.error('❌ 数据库连接错误:', errorMessage);
        throw error;
      }
    }
  }
  
  return false;
}

/**
 * 获取数据库连接状态信息
 */
export async function getDatabaseStatus(): Promise<{
  connected: boolean;
  latency?: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - startTime;
    
    return {
      connected: true,
      latency,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return {
      connected: false,
      error: errorMessage,
    };
  }
}

/**
 * 定期发送心跳以保持 Neon 数据库活跃
 * 
 * @param intervalMs 心跳间隔（毫秒），默认 5 分钟
 * @returns 清理函数，调用可停止心跳
 */
export function startDatabaseHeartbeat(intervalMs = 5 * 60 * 1000): () => void {
  console.log(`💓 启动数据库心跳（间隔: ${intervalMs / 1000 / 60} 分钟）`);
  
  const heartbeat = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('💓 数据库心跳正常');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('⚠️  数据库心跳失败:', errorMessage);
    }
  }, intervalMs);
  
  // 返回清理函数
  return () => {
    clearInterval(heartbeat);
    console.log('🛑 数据库心跳已停止');
  };
}

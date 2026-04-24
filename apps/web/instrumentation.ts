import { startScheduler } from './lib/services/TaskScheduler';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
// 在 Vercel 环境中，环境变量通过平台设置，不需要从文件加载
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
}

// Next.js instrumentation file - runs when the server starts
export async function register() {
  // 只在 Node.js 运行时且未禁用调度器时启动
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.DISABLE_SCHEDULER !== 'true') {
    console.log('\n🚀 ========================================');
    console.log('🚀 Starting SkillHub Task Scheduler...');
    console.log('🚀 ========================================\n');
    
    // Check environment variables
    console.log('Environment Check:');
    console.log(`  GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  SKILLSMP_API_KEY: ${process.env.SKILLSMP_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
    console.log('');
    
    // Fire and forget - don't await to avoid blocking server startup
    // 使用 process.nextTick 确保完全不阻塞 Next.js 服务器启动
    process.nextTick(async () => {
      try {
        // 额外延迟,确保 Prisma 和其他服务完全初始化
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🔄 Initializing Task Scheduler...');
        await startScheduler();
        console.log('\n✅ Task Scheduler initialized successfully\n');
      } catch (error) {
        console.error('\n⚠️ Task Scheduler initialization failed (non-critical):', error instanceof Error ? error.message : error);
        console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
        console.log('⚠️ Website will still function normally without scheduler\n');
      }
    });
  } else if (process.env.DISABLE_SCHEDULER === 'true') {
    console.log('\nℹ️  Task Scheduler is disabled via DISABLE_SCHEDULER environment variable\n');
  }
}
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
  if (process.env.NEXT_RUNTIME === 'nodejs') {
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
    startScheduler().then(() => {
      console.log('\n✅ Task Scheduler initialized successfully\n');
    }).catch((error) => {
      console.error('\n❌ Task Scheduler initialization failed:', error);
    });
  }
}
import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';

// 加载环境变量
config({ path: resolve(__dirname, '.env.local') });

console.log('🔄 Running Prisma migration...\n');

try {
  // 执行迁移
  execSync('npx prisma migrate dev --name add_subcategory_and_confidence', {
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n✅ Migration completed successfully!');
  
  // 生成Prisma Client
  console.log('\n🔧 Generating Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n✅ Prisma Client generated!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}

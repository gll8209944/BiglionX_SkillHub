require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');

try {
  console.log('🔄 推送数据库变更...');
  execSync('npx prisma db push', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  console.log('✅ 数据库变更推送成功！');
} catch (error) {
  console.error('❌ 数据库变更推送失败:', error.message);
  process.exit(1);
}

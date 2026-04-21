require('dotenv').config({ path: './.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserDetails() {
  try {
    const users = await prisma.user.findMany({ 
      select: { 
        id: true, 
        email: true, 
        name: true,
        password: true,
        emailVerified: true
      } 
    });
    
    console.log('用户详情:\n');
    users.forEach(user => {
      console.log(`邮箱: ${user.email}`);
      console.log(`  名称: ${user.name || '无'}`);
      console.log(`  有密码: ${user.password ? '✅ 是' : '❌ 否'}`);
      console.log(`  密码长度: ${user.password ? user.password.length : 'N/A'}`);
      console.log(`  邮箱验证: ${user.emailVerified ? '✅ 已验证' : '❌ 未验证'}`);
      console.log('');
    });
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('错误:', err.message);
    await prisma.$disconnect();
  }
}

checkUserDetails();

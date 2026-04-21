require('dotenv').config({ path: './.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const count = await prisma.user.count();
    console.log('用户总数:', count);
    
    if (count > 0) {
      const users = await prisma.user.findMany({ 
        take: 5, 
        select: { 
          id: true, 
          email: true, 
          name: true 
        } 
      });
      console.log('\n示例用户:');
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.name || '无名称'})`);
      });
    } else {
      console.log('\n⚠️  数据库中没有用户记录');
      console.log('请先注册一个账户：http://localhost:3000/register');
    }
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('错误:', err.message);
    await prisma.$disconnect();
  }
}

checkUsers();

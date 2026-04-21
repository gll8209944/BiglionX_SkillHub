require('dotenv').config({ path: './.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'admin@skillhub.com';
    const password = 'admin123';
    const name = '管理员';
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log(`用户 ${email} 已存在`);
      console.log('请使用以下凭据登录:');
      console.log(`  邮箱: ${email}`);
      console.log(`  密码: ${password}`);
      await prisma.$disconnect();
      return;
    }
    
    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(),
      }
    });
    
    console.log('✅ 测试用户创建成功!\n');
    console.log('请使用以下凭据登录:');
    console.log(`  邮箱: ${email}`);
    console.log(`  密码: ${password}`);
    console.log('\n访问: http://localhost:3000/login');
    
    await prisma.$disconnect();
  } catch (err) {
    console.error('错误:', err.message);
    await prisma.$disconnect();
  }
}

createTestUser();

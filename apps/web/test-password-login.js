/* eslint-disable no-undef */
/* eslint-env node */
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const prisma = new PrismaClient();

  try {
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (existingUser) {
      console.log('测试用户已存在:', existingUser.email);
      return;
    }

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('Test123456', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: '测试用户',
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    console.log('✓ 测试用户创建成功!');
    console.log('邮箱:', user.email);
    console.log('密码: Test123456');
    console.log('\n现在可以使用以下凭据登录:');
    console.log('- 选择"密码登录"选项卡');
    console.log('- 邮箱: test@example.com');
    console.log('- 密码: Test123456');
  } catch (error) {
    console.error('创建测试用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

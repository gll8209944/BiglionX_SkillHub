import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 创建测试用户...\n');
    
    const testEmail = 'test@skillhub.com';
    const testPassword = 'Test123456';
    const testName = '测试用户';
    
    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    
    if (existingUser) {
      console.log('⚠️  测试用户已存在，将更新密码');
      
      // 哈希密码
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      
      // 更新用户密码
      await prisma.user.update({
        where: { email: testEmail },
        data: { password: hashedPassword },
      });
      
      console.log('✅ 测试用户密码已更新');
    } else {
      // 哈希密码
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      
      // 创建新用户
      await prisma.user.create({
        data: {
          email: testEmail,
          name: testName,
          password: hashedPassword,
          emailVerified: new Date(),
        },
      });
      
      console.log('✅ 测试用户创建成功');
    }
    
    console.log('\n📋 测试用户信息:');
    console.log(`   邮箱: ${testEmail}`);
    console.log(`   密码: ${testPassword}`);
    console.log(`   姓名: ${testName}`);
    console.log('\n💡 现在可以使用这些信息测试密码登录功能');
    
  } catch (error) {
    console.error('❌ 创建测试用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
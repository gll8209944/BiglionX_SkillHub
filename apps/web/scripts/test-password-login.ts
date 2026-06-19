import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function testPasswordLogin() {
  try {
    console.log('🔐 测试密码登录功能...\n');
    
    const testEmail = 'test@skillhub.com';
    const testPassword = 'Test123456';
    
    console.log('步骤 1: 从数据库获取用户...');
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });
    
    if (!user) {
      console.error('❌ 用户不存在');
      return;
    }
    
    console.log('✅ 用户找到:');
    console.log(`   ID: ${user.id}`);
    console.log(`   邮箱: ${user.email}`);
    console.log(`   姓名: ${user.name}`);
    console.log(`   密码哈希: ${user.password ? '已设置' : '未设置'}`);
    console.log('');
    
    if (!user.password) {
      console.error('❌ 用户没有设置密码');
      return;
    }
    
    console.log('步骤 2: 验证密码...');
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    if (isValid) {
      console.log('✅ 密码验证成功！');
      console.log('');
      console.log('📋 登录测试结果:');
      console.log('   ✓ 用户存在');
      console.log('   ✓ 密码正确');
      console.log('   ✓ 可以成功登录');
      console.log('');
      console.log('💡 测试凭据:');
      console.log(`   邮箱: ${testEmail}`);
      console.log(`   密码: ${testPassword}`);
    } else {
      console.error('❌ 密码验证失败');
      console.log('');
      console.log('⚠️  可能的原因:');
      console.log('   1. 密码不正确');
      console.log('   2. 密码哈希损坏');
      console.log('   3. bcrypt 版本不兼容');
    }
    
    // 测试错误密码
    console.log('\n步骤 3: 测试错误密码...');
    const wrongPassword = 'WrongPassword123';
    const isWrongValid = await bcrypt.compare(wrongPassword, user.password);
    
    if (!isWrongValid) {
      console.log('✅ 错误密码被正确拒绝');
    } else {
      console.error('❌ 错误密码意外通过验证（安全问题！）');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPasswordLogin();
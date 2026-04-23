/**
 * 测试密码登录功能
 */

// 首先加载环境变量
import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(__dirname, '../apps/web/.env.local');
const result = config({ path: envPath, override: true });

if (!result.parsed) {
  console.error('❌ 无法加载环境变量文件:', envPath);
  process.exit(1);
}

console.log('✅ 环境变量已加载\n');

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

async function testPasswordLogin() {
  const adminEmail = '1055603323@qq.com';
  const testPassword = 'Admin@123456';
  
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 测试密码登录流程...\n');
    console.log(`测试邮箱: ${adminEmail}`);
    console.log(`测试密码: ${testPassword}\n`);
    
    // 步骤 1: 查找用户
    console.log('步骤 1: 查找用户...');
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
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
    
    console.log('✅ 用户找到');
    console.log(`   ID: ${user.id}`);
    console.log(`   邮箱: ${user.email}`);
    console.log(`   姓名: ${user.name || '未设置'}`);
    console.log(`   密码哈希: ${user.password ? user.password.substring(0, 20) + '...' : '未设置'}\n`);
    
    // 步骤 2: 验证密码
    console.log('步骤 2: 验证密码...');
    if (!user.password) {
      console.error('❌ 用户没有设置密码');
      return;
    }
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    if (isValid) {
      console.log('✅ 密码验证成功!');
      console.log('\n🎉 登录测试通过!');
      console.log('\n📋 您可以使用以下凭据登录:');
      console.log(`   邮箱: ${adminEmail}`);
      console.log(`   密码: ${testPassword}`);
      console.log('\n💡 下一步:');
      console.log('   1. 访问: http://localhost:3000/login');
      console.log('   2. 切换到"密码登录"标签');
      console.log('   3. 输入上面的邮箱和密码');
      console.log('   4. 点击"登录"按钮');
    } else {
      console.error('❌ 密码验证失败');
      console.error('\n可能的原因:');
      console.error('   1. 密码不正确');
      console.error('   2. 密码哈希损坏');
      console.error('   3. bcrypt 版本不兼容');
      
      // 尝试重新设置密码
      console.log('\n🔄 尝试重新设置密码...');
      const newPassword = 'Admin@123456';
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      console.log('✅ 密码已重新设置');
      console.log(`   新密码: ${newPassword}`);
      
      // 再次验证
      console.log('\n🔄 再次验证新密码...');
      const isValid2 = await bcrypt.compare(newPassword, hashedPassword);
      if (isValid2) {
        console.log('✅ 新密码验证成功!');
      } else {
        console.error('❌ 新密码验证也失败了，可能存在系统问题');
      }
    }
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testPasswordLogin();

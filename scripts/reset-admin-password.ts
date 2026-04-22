/**
 * 重置Admin用户密码脚本
 * 
 * 使用方法:
 * npx tsx scripts/reset-admin-password.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import bcrypt from 'bcryptjs';
import { prisma } from '../apps/web/lib/prisma';

// 加载环境变量
config({ path: resolve(__dirname, '../apps/web/.env.local') });

async function resetAdminPassword() {
  const adminEmail = '1055603323@qq.com';
  
  console.log('🔍 检查Admin用户...\n');
  console.log(`邮箱: ${adminEmail}`);
  
  try {
    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
        createdAt: true,
      },
    });
    
    if (!user) {
      console.log('\n❌ 用户不存在');
      console.log('\n💡 提示: 需要先注册该邮箱账号');
      console.log('   访问: http://localhost:3000/register');
      return;
    }
    
    console.log('\n✅ 用户存在');
    console.log(`   ID: ${user.id}`);
    console.log(`   姓名: ${user.name || '未设置'}`);
    console.log(`   邮箱验证: ${user.emailVerified ? '已验证' : '未验证'}`);
    console.log(`   创建时间: ${user.createdAt.toLocaleString('zh-CN')}`);
    console.log(`   密码状态: ${user.password ? '已设置' : '未设置'}`);
    
    // 生成新密码
    const newPassword = 'Admin@123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('\n🔄 正在重置密码...');
    
    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });
    
    console.log('\n✅ 密码重置成功!');
    console.log('\n📋 登录信息:');
    console.log(`   邮箱: ${adminEmail}`);
    console.log(`   密码: ${newPassword}`);
    console.log('\n⚠️  重要: 请立即使用此密码登录，然后修改为更安全的密码');
    console.log('\n💡 下一步:');
    console.log('   1. 访问: http://localhost:3000/login');
    console.log('   2. 切换到"邮箱登录"标签');
    console.log('   3. 使用上面的邮箱和密码登录');
    
  } catch (error) {
    console.error('\n❌ 操作失败:', error instanceof Error ? error.message : 'Unknown error');
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();

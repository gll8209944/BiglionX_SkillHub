/**
 * 检查并修复 admin 用户密码
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

console.log('✅ 环境变量已加载');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已设置' : '未设置');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL 未设置');
  process.exit(1);
}

// 现在才导入其他模块
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

async function checkAndFixAdminPassword() {
  const adminEmail = '1055603323@qq.com';
  const newPassword = 'Admin@123456';
  
  const prisma = new PrismaClient();
  
  try {
    console.log('\n🔍 检查 Admin 用户...\n');
    console.log(`邮箱: ${adminEmail}`);
    
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
    
    // 生成新密码哈希
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
    console.log('   2. 切换到"密码登录"标签');
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

checkAndFixAdminPassword();

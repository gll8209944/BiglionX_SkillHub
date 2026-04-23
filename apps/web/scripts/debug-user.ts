import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function debugUser() {
  try {
    console.log('🔍 调试用户信息...\n');
    
    const testEmail = 'test@skillhub.com';
    
    console.log('步骤 1: 查询用户...');
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    
    if (!user) {
      console.error('❌ 用户不存在');
      return;
    }
    
    console.log('✅ 用户信息:');
    console.log(JSON.stringify(user, null, 2));
    console.log('');
    
    console.log('步骤 2: 检查密码字段...');
    if (user.password) {
      console.log(`✅ 密码哈希存在`);
      console.log(`   长度: ${user.password.length}`);
      console.log(`   前缀: ${user.password.substring(0, 10)}...`);
      
      // 检查是否是有效的 bcrypt 哈希
      if (user.password.startsWith('$2')) {
        console.log('✅ 密码格式正确（bcrypt）');
      } else {
        console.error('⚠️  密码格式可能不正确');
      }
    } else {
      console.error('❌ 密码字段为空');
    }
    console.log('');
    
    console.log('步骤 3: 检查关联的账户...');
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
    });
    
    if (accounts.length === 0) {
      console.log('ℹ️  没有关联的 OAuth 账户（正常，这是密码登录用户）');
    } else {
      console.log(`✅ 找到 ${accounts.length} 个关联账户:`);
      accounts.forEach(account => {
        console.log(`   - Provider: ${account.provider}`);
        console.log(`     Type: ${account.type}`);
      });
    }
    console.log('');
    
    console.log('步骤 4: 检查用户角色和状态...');
    console.log(`   角色: ${user.role || 'USER'}`);
    console.log(`   邮箱验证: ${user.emailVerified ? '已验证' : '未验证'}`);
    console.log(`   账户禁用: ${user.isDisabled ? '是' : '否'}`);
    console.log(`   创建时间: ${user.createdAt}`);
    console.log(`   更新时间: ${user.updatedAt}`);
    
  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUser();
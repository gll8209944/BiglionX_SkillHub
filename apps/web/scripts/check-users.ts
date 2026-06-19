import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 检查数据库中的用户...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    if (users.length === 0) {
      console.log('❌ 数据库中没有用户');
    } else {
      console.log(`✅ 找到 ${users.length} 个用户:\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. 邮箱: ${user.email}`);
        console.log(`   姓名: ${user.name || '未设置'}`);
        console.log(`   密码哈希: ${user.password ? '已设置' : '未设置'}`);
        console.log(`   创建时间: ${user.createdAt.toLocaleString('zh-CN')}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ 查询用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
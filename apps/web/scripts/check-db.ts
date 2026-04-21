import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('📊 检查数据库中的 Skills 数据...\n');
  
  const total = await prisma.skill.count();
  console.log('总技能数:', total);
  
  const byStatus = await prisma.skill.groupBy({
    by: ['status'],
    _count: true,
  });
  console.log('\n按状态分布:');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  byStatus.forEach((s: any) => {
    console.log(`  ${s.status}: ${s._count}`);
  });
  
  const approved = await prisma.skill.count({ 
    where: { status: 'APPROVED', isPublic: true } 
  });
  console.log('\n已批准且公开:', approved);
  
  const withJsonEmbedding = await prisma.skill.count({ 
    where: { embedding: { not: Prisma.JsonNull } } 
  });
  console.log('有 embedding(JSON) 的:', withJsonEmbedding);
  
  const withoutEmbedding = await prisma.skill.count({
    where: { embedding: { equals: Prisma.JsonNull } }
  });
  console.log('没有 embedding(JSON) 的:', withoutEmbedding);
  
  console.log('\n✅ 检查完成');
  
  await prisma.$disconnect();
  process.exit(0);
}

check().catch(console.error);

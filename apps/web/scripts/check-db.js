require('dotenv').config({ path: './.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('📊 检查数据库 Skills 数据...\n');
  
  const total = await prisma.skill.count();
  console.log('总技能数:', total);
  
  const byStatus = await prisma.skill.groupBy({
    by: ['status'],
    _count: true,
  });
  console.log('\n按状态分布:');
  byStatus.forEach(s => {
    console.log(`  ${s.status}: ${s._count}`);
  });
  
  const approved = await prisma.skill.count({ 
    where: { status: 'APPROVED', isPublic: true } 
  });
  console.log('\n已批准且公开:', approved);
  
  const withEmbedding = await prisma.skill.count({ 
    where: { embedding: { not: null } } 
  });
  console.log('有 embedding 的:', withEmbedding);
  
  const withoutEmbedding = total - withEmbedding;
  console.log('没有 embedding 的:', withoutEmbedding);
  
  console.log('\n✅ 检查完成');
  await prisma.$disconnect();
  process.exit(0);
}

main().catch(console.error);

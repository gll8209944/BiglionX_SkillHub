import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('📊 检查数据库中的 Skills 数据...\n');
  
  // 1. 总数
  const total = await prisma.skill.count();
  console.log('总技能数:', total);
  
  // 2. 按状态统计
  const byStatus = await prisma.skill.groupBy({
    by: ['status'],
    _count: true,
  });
  console.log('\n按状态分布:');
  byStatus.forEach((s: { status: string; _count: number }) => {
    console.log(`  ${s.status}: ${s._count}`);
  });
  
  // 3. 已批准且公开的（首页显示的）
  const approved = await prisma.skill.count({ 
    where: { status: 'APPROVED', isPublic: true } 
  });
  console.log('\n已批准且公开:', approved);
  
  // 4. 有 embedding(JSON) 的
  const withJsonEmbedding = await prisma.skill.count({ 
    where: { embedding: { not: Prisma.JsonNull } } 
  });
  console.log('有 embedding(JSON) 的:', withJsonEmbedding);
  
  // 5. 有 embeddingVector 的（通过获取所有技能然后过滤）
  const allSkills = await prisma.skill.findMany({
    select: { id: true, embeddingVector: true }
  });
  const withVectorEmbedding = allSkills.filter(s => 
    s.embeddingVector && s.embeddingVector.length > 0
  ).length;
  console.log('有 embeddingVector 的:', withVectorEmbedding);
  
  // 6. 完全没有 embedding 的
  const withoutEmbedding = await prisma.skill.count({
    where: { 
      AND: [
        { embedding: { equals: Prisma.JsonNull } },
        { embeddingVector: { equals: [] } }
      ]
    }
  });
  console.log('完全没有 embedding 的:', withoutEmbedding);
  
  console.log('\n✅ 检查完成');
  
  await prisma.$disconnect();
  process.exit(0);
}

check().catch(console.error);

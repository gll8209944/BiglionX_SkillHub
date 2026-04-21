import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function syncEmbeddings() {
  console.log('🔄 开始同步 embedding 数据到 embeddingVector...\n');

  // 查找有 embedding (JSON) 但没有 embeddingVector 的记录
  // 注意：这里使用 findMany 并手动更新，或者使用 updateMany
  // 由于 embedding 是 JSON，直接赋值给 Float[] 可能需要转换
  
  // 先查一下有多少条需要同步
  const count = await prisma.skill.count({
    where: {
      embedding: { not: Prisma.JsonNull },
      embeddingVector: { equals: [] }
    }
  });

  console.log(`发现 ${count} 条记录需要同步...\n`);

  if (count === 0) {
    console.log('✅ 所有记录已同步，无需操作');
    await prisma.$disconnect();
    process.exit(0);
  }

  // 分批同步
  const batchSize = 100;
  let processed = 0;

  for (let i = 0; i < count; i += batchSize) {
    const skills = await prisma.skill.findMany({
      where: {
        embedding: { not: Prisma.JsonNull },
        embeddingVector: { equals: [] }
      },
      select: {
        id: true,
        embedding: true
      },
      take: batchSize
    });

    for (const skill of skills) {
      if (skill.embedding) {
        try {
          // 将 JSON embedding 转换为 Float[] 并保存
          // 注意：确保 embedding 是数组格式
          const vector = Array.isArray(skill.embedding) 
            ? skill.embedding 
            : JSON.parse(skill.embedding as string);

          await prisma.skill.update({
            where: { id: skill.id },
            data: {
              embeddingVector: vector
            }
          });
          processed++;
        } catch (err) {
          console.error(`❌ 同步失败 (ID: ${skill.id}):`, err);
        }
      }
    }
    
    console.log(`⏳ 进度: ${processed}/${count}`);
  }

  console.log(`\n✅ 同步完成！共处理 ${processed} 条记录`);
  console.log('🎉 语义搜索现在可以使用了！');
  
  await prisma.$disconnect();
  process.exit(0);
}

syncEmbeddings().catch(console.error);

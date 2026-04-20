import { config } from 'dotenv';
import { resolve } from 'path';
import { prisma } from '../apps/web/lib/prisma';

// 加载环境变量
config({ path: resolve(__dirname, '../apps/web/.env.local') });

async function verifySkills() {
  const [total, github, top] = await Promise.all([
    prisma.skill.count(),
    prisma.skill.count({ where: { source: 'github' } }),
    prisma.skill.findMany({ 
      take: 5, 
      orderBy: { starCount: 'desc' }, 
      select: { 
        name: true, 
        starCount: true, 
        qualityScore: true, 
        repositoryUrl: true 
      }
    })
  ]);

  console.log('\n📊 数据库状态:');
  console.log('总技能数:', total);
  console.log('GitHub 技能:', github);
  
  console.log('\n⭐ Top 5 热门技能:');
  top.forEach((s, i) => {
    console.log(`   ${i+1}. ${s.name} (${s.starCount}⭐, Quality: ${s.qualityScore})`);
  });

  await prisma.$disconnect();
}

verifySkills().catch(console.error);

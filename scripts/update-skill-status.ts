import { config } from 'dotenv';
import { resolve } from 'path';
import { prisma } from '../apps/web/lib/prisma';

// 加载环境变量
config({ path: resolve(__dirname, '../apps/web/.env.local') });

async function updateSkillStatus() {
  console.log('🔍 检查技能状态...\n');

  // 查询所有 GitHub 来源的技能
  const githubSkills = await prisma.skill.findMany({
    where: { source: 'github' },
    select: {
      id: true,
      name: true,
      status: true,
      isPublic: true,
    },
    take: 5,
  });

  console.log('当前技能状态示例:');
  githubSkills.forEach(skill => {
    console.log(`  - ${skill.name}: status=${skill.status}, isPublic=${skill.isPublic}`);
  });

  // 统计需要更新的技能数量
  const draftCount = await prisma.skill.count({
    where: { 
      source: 'github',
      status: 'DRAFT' 
    },
  });

  console.log(`\n📊 需要更新的技能数: ${draftCount}\n`);

  if (draftCount > 0) {
    console.log('⚙️  开始更新技能状态...\n');
    
    // 批量更新：将 DRAFT 改为 APPROVED，并设置为公开
    const result = await prisma.skill.updateMany({
      where: { 
        source: 'github',
        status: 'DRAFT' 
      },
      data: {
        status: 'APPROVED',
        isPublic: true,
      },
    });

    console.log(`✅ 成功更新 ${result.count} 个技能`);
    console.log('   - status: DRAFT → APPROVED');
    console.log('   - isPublic: false → true\n');

    // 验证更新结果
    const approvedCount = await prisma.skill.count({
      where: { 
        source: 'github',
        status: 'APPROVED',
        isPublic: true,
      },
    });

    console.log(`📈 当前公开的技能数: ${approvedCount}`);
  } else {
    console.log('✅ 所有技能已经是正确状态');
  }

  await prisma.$disconnect();
}

updateSkillStatus().catch(console.error);

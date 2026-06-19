// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSkillStatus() {
  try {
    // 按状态统计
    const statusCounts = await prisma.skill.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log('📊 Skills by status:');
    console.table(statusCounts);

    const total = await prisma.skill.count();
    const approved = await prisma.skill.count({ where: { status: 'APPROVED' } });
    
    console.log(`\n✅ Total skills: ${total}`);
    console.log(`✅ Approved skills (visible on frontend): ${approved}`);
    console.log(`⚠️  Non-approved skills: ${total - approved}`);

    if (approved === 0) {
      console.log('\n💡 No approved skills! You need to approve some skills first.');
      console.log('   Visit /admin/skills to review and approve pending skills.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkSkillStatus();

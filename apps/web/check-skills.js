// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSkills() {
  try {
    // 检查技能总数
    const count = await prisma.skill.count();
    console.log('📊 Total skills in database:', count);

    // 检查最近的技能
    if (count > 0) {
      const recent = await prisma.skill.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          createdAt: true,
        },
      });
      console.log('\n📝 Recent skills:');
      console.table(recent);
    } else {
      console.log('\n⚠️  No skills found in database!');
      console.log('\n💡 Suggestions:');
      console.log('   1. Run crawler to fetch skills from external sources');
      console.log('   2. Manually add skills through the admin panel');
      console.log('   3. Import skills from a backup');
    }

    // 检查是否有外部来源的技能
    const externalCount = await prisma.skill.count({
      where: {
        source: { not: null },
      },
    });
    console.log(`\n🌐 Skills from external sources: ${externalCount}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkSkills();

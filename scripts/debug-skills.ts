import { prisma } from '../apps/web/lib/prisma';

async function checkSkills() {
  try {
    console.log('🔍 Checking skills in database...\n');
    
    const count = await prisma.skill.count();
    console.log(`Total skills in database: ${count}\n`);
    
    if (count > 0) {
      const sample = await prisma.skill.findMany({
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          isPublic: true,
          category: true,
          subcategory: true,
        },
      });
      
      console.log('Sample skills:');
      sample.forEach((skill, i) => {
        console.log(`${i + 1}. ${skill.name}`);
        console.log(`   Slug: ${skill.slug}`);
        console.log(`   Status: ${skill.status}`);
        console.log(`   Is Public: ${skill.isPublic}`);
        console.log(`   Category: ${skill.category}`);
        console.log(`   Subcategory: ${skill.subcategory || 'N/A'}`);
        console.log();
      });
      
      // Check by status
      const byStatus = await prisma.skill.groupBy({
        by: ['status'],
        _count: true,
      });
      
      console.log('Skills by status:');
      byStatus.forEach(stat => {
        console.log(`  ${stat.status}: ${stat._count}`);
      });
      
      // Check public skills
      const publicCount = await prisma.skill.count({
        where: { isPublic: true, status: 'APPROVED' },
      });
      
      console.log(`\nPublic & Approved skills: ${publicCount}`);
    } else {
      console.log('⚠️  Database is empty! No skills found.');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

checkSkills();

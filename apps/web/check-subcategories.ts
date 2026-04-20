import { config } from 'dotenv';
import { resolve } from 'path';
import { prisma } from './lib/prisma';

config({ path: resolve(__dirname, '.env.local') });

async function checkSubcategories() {
  console.log('🔍 Checking subcategories and confidence for new Skills...\n');
  
  // Get skills with subcategory
  const skillsWithSubcategory = await prisma.skill.findMany({
    where: {
      source: 'github',
      subcategory: { not: null }
    },
    take: 15,
    orderBy: { createdAt: 'desc' },
    select: {
      name: true,
      category: true,
      subcategory: true,
      confidence: true,
      starCount: true,
    }
  });
  
  console.log(`Found ${skillsWithSubcategory.length} skills with subcategories:\n`);
  
  skillsWithSubcategory.forEach((skill, index) => {
    console.log(`${index + 1}. ${skill.name}`);
    console.log(`   Category: ${skill.category}`);
    console.log(`   Subcategory: ${skill.subcategory || 'N/A'}`);
    console.log(`   Confidence: ${skill.confidence}%`);
    console.log(`   Stars: ${skill.starCount}`);
    console.log();
  });
  
  // Statistics by category only (simplified)
  const categoryStats = await prisma.skill.groupBy({
    by: ['category'],
    _count: true,
    where: {
      source: 'github',
    },
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 CATEGORY STATISTICS');
  console.log('='.repeat(70));
  
  categoryStats
    .sort((a, b) => b._count - a._count)
    .forEach(stat => {
      const percentage = Math.round((stat._count / 238) * 100);
      console.log(`  ${stat.category.padEnd(20)}: ${stat._count.toString().padStart(3)} (${percentage}%)`);
    });
  
  console.log('\n' + '='.repeat(70));
  
  await prisma.$disconnect();
}

checkSubcategories().catch(console.error);

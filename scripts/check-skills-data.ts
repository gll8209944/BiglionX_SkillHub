import { prisma } from '../apps/web/lib/prisma';

async function checkSkills() {
  const count = await prisma.skill.count();
  console.log('Total skills:', count);
  
  const withSubcategory = await prisma.skill.count({ 
    where: { subcategory: { not: null } } 
  });
  console.log('With subcategory:', withSubcategory);
  
  const withoutSubcategory = await prisma.skill.count({ 
    where: { subcategory: null } 
  });
  console.log('Without subcategory:', withoutSubcategory);
  
  if (withoutSubcategory > 0) {
    console.log('\nFirst 5 skills without subcategory:');
    const skills = await prisma.skill.findMany({
      where: { subcategory: null },
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
      }
    });
    
    skills.forEach((skill, i) => {
      console.log(`${i + 1}. ${skill.name} (${skill.category})`);
      console.log(`   Description: ${skill.description?.substring(0, 100)}...`);
    });
  }
  
  await prisma.$disconnect();
}

checkSkills().catch(console.error);

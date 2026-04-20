/**
 * 批量重新分类脚本 - 为现有Skills填充子分类和置信度
 * 
 * 使用方法:
 * npx tsx scripts/reclassify-skills.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { prisma } from '../apps/web/lib/prisma';
import { SmartClassifier } from '../apps/web/lib/utils/SmartClassifier';

// 加载环境变量
config({ path: resolve(__dirname, '../apps/web/.env.local') });

const classifier = new SmartClassifier();

async function reclassifySkills() {
  console.log('🚀 Starting batch reclassification...\n');
  
  // 获取所有需要重新分类的skills
  const skills = await prisma.skill.findMany({
    where: {
      OR: [
        { subcategory: null },
        { confidence: { lt: 70 } }, // 置信度低于70的也重新分类
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      tags: true,
      languages: true,
      category: true,
      subcategory: true,
      confidence: true,
    },
  });
  
  console.log(`Found ${skills.length} skills to reclassify\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let unchangedCount = 0;
  
  for (let i = 0; i < skills.length; i++) {
    const skill = skills[i];
    
    try {
      // 使用智能分类器重新分类
      const classification = classifier.classify({
        name: skill.name,
        description: skill.description,
        tags: skill.tags,
        languages: skill.languages,
      });
      
      // 检查是否有变化
      const hasChanges = 
        classification.subcategory !== skill.subcategory ||
        Math.abs(classification.confidence - (skill.confidence || 0)) > 5;
      
      if (!hasChanges) {
        unchangedCount++;
        if ((i + 1) % 50 === 0) {
          console.log(`Processed ${i + 1}/${skills.length} skills...`);
        }
        continue;
      }
      
      // 更新数据库
      await prisma.skill.update({
        where: { id: skill.id },
        data: {
          subcategory: classification.subcategory,
          confidence: classification.confidence,
        },
      });
      
      successCount++;
      
      if ((i + 1) % 50 === 0) {
        console.log(`✅ Processed ${i + 1}/${skills.length} skills (${successCount} updated, ${errorCount} errors, ${unchangedCount} unchanged)`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ Error processing skill "${skill.name}":`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 Reclassification Summary');
  console.log('='.repeat(70));
  console.log(`Total skills processed: ${skills.length}`);
  console.log(`Successfully updated: ${successCount}`);
  console.log(`Unchanged: ${unchangedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log('='.repeat(70));
  
  // 显示统计信息
  const stats = await prisma.skill.groupBy({
    by: ['category', 'subcategory'],
    _count: true,
    orderBy: {
      _count: {
        category: 'desc',
      },
    },
  });
  
  console.log('\n📈 Category/Subcategory Distribution:');
  console.log('-'.repeat(70));
  
  const categoryMap = new Map<string, Array<{ subcategory: string | null; count: number }>>();
  
  stats.forEach(stat => {
    const category = stat.category;
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    const subcategories = categoryMap.get(category);
    if (subcategories) {
      subcategories.push({
        subcategory: stat.subcategory,
        count: stat._count ?? 0,
      });
    }
  });
  
  categoryMap.forEach((subcategories, category) => {
    console.log(`\n${category}:`);
    subcategories.forEach(sub => {
      const label = sub.subcategory ? `  └─ ${sub.subcategory}` : '  └─ (no subcategory)';
      console.log(`${label.padEnd(30)}: ${sub.count} skills`);
    });
  });
  
  await prisma.$disconnect();
  console.log('\n✅ Reclassification completed!');
}

// 运行脚本
reclassifySkills().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

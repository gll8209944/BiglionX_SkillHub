/**
 * 语义搜索功能测试脚本
 * 
 * 使用方法:
 * npm run test-semantic-search
 */

import { PrismaClient } from '@prisma/client';
import { semanticSearchService } from './lib/search/SemanticSearchService.js';

const prisma = new PrismaClient();

async function testSemanticSearch() {
  console.log('🧪 开始测试语义搜索功能...\n');

  try {
    // 测试1: 检查是否有带embeddings的skills
    console.log('📊 测试1: 检查数据库中是否有带embeddings的Skills');
    const skillsWithEmbeddings = await prisma.skill.findMany({
      where: {
        embedding: { not: { equals: null } },
        status: 'APPROVED',
      },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        embedding: true,
      },
    });

    console.log(`✅ 找到 ${skillsWithEmbeddings.length} 个带embeddings的Skills`);
    
    if (skillsWithEmbeddings.length === 0) {
      console.log('\n⚠️  数据库中没有带embeddings的Skills');
      console.log('💡 提示: 请先运行批量生成embeddings脚本');
      console.log('   命令: npm run generate-embeddings\n');
      return;
    }

    // 显示示例Skills
    console.log('\n示例Skills:');
    skillsWithEmbeddings.forEach((skill, index) => {
      const embeddingArray = Array.isArray(skill.embedding) 
        ? skill.embedding 
        : JSON.parse(JSON.stringify(skill.embedding));
      console.log(`  ${index + 1}. ${skill.name}`);
      console.log(`     分类: ${skill.category}`);
      console.log(`     Embedding维度: ${embeddingArray.length}\n`);
    });

    // 测试2: 执行语义搜索
    console.log('🔍 测试2: 执行语义搜索');
    const searchQuery = 'AI chatbot for customer service';
    console.log(`查询: "${searchQuery}"\n`);

    const searchResults = await semanticSearchService.search({
      query: searchQuery,
      limit: 5,
      minSimilarity: 0.3,
    });

    console.log(`✅ 找到 ${searchResults.length} 个结果`);
    
    if (searchResults.length > 0) {
      console.log('\n搜索结果:');
      searchResults.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.name}`);
        console.log(`     相似度: ${(result.similarity * 100).toFixed(2)}%`);
        console.log(`     分类: ${result.category}`);
        console.log(`     描述: ${result.description.substring(0, 100)}...`);
        console.log('');
      });
    } else {
      console.log('\n⚠️  没有找到相关结果');
      console.log('💡 可能的原因:');
      console.log('   1. 数据库中的Skills数量太少');
      console.log('   2. 相似度阈值设置过高');
      console.log('   3. Skills的embeddings质量不高\n');
    }

    // 测试3: 获取相关Skills
    if (skillsWithEmbeddings.length > 0) {
      console.log('🔗 测试3: 获取相关Skills');
      const targetSkill = skillsWithEmbeddings[0];
      console.log(`目标Skill: ${targetSkill.name}\n`);

      const relatedSkills = await semanticSearchService.getRelatedSkills(
        targetSkill.id,
        5,
        0.3
      );

      console.log(`✅ 找到 ${relatedSkills.length} 个相关Skills`);
      
      if (relatedSkills.length > 0) {
        console.log('\n相关Skills:');
        relatedSkills.forEach((skill, index) => {
          console.log(`  ${index + 1}. ${skill.name}`);
          console.log(`     相似度: ${(skill.similarity * 100).toFixed(2)}%`);
          console.log(`     分类: ${skill.category}`);
          console.log('');
        });
      }
    }

    console.log('✨ 所有测试完成！\n');
    console.log('📝 下一步:');
    console.log('   1. 访问 http://localhost:3000/skills');
    console.log('   2. 在搜索框中启用"语义搜索"开关');
    console.log('   3. 输入搜索词进行测试');
    console.log('   4. 访问任意Skill详情页查看"相关Skills"推荐\n');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行测试
testSemanticSearch();

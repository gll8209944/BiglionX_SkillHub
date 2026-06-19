/**
 * 高级搜索示例
 */

import { SearchSDK } from '../src';

const sdk = new SearchSDK({
  apiUrl: 'http://localhost:3000/api',
});

async function advancedSearchExample() {
  console.log('⚙️ 执行高级搜索...\n');

  try {
    // 多条件组合搜索
    const results = await sdk.advancedSearch({
      query: 'data processing',
      categories: ['development', 'data-science'],
      languages: ['python', 'javascript'],
      sources: ['github'],
      minStars: 50,
      minQualityScore: 6.0,
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date(),
      },
      page: 1,
      pageSize: 15,
    });

    console.log(`找到 ${results.total} 个结果\n`);

    results.skills.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.name}`);
      console.log(`   描述: ${skill.description}`);
      console.log(`   分类: ${skill.category || 'N/A'}`);
      console.log(`   语言: ${(skill.languages || []).join(', ')}`);
      console.log(`   Stars: ${skill.starCount || 0}`);
      console.log(`   质量评分: ${skill.qualityScore?.toFixed(1) || 'N/A'}`);
      console.log('');
    });
  } catch (error) {
    console.error('高级搜索失败:', error instanceof Error ? error.message : error);
  }
}

advancedSearchExample();

/**
 * 相关技能示例
 */

import { SearchSDK } from '../src';

const sdk = new SearchSDK({
  apiUrl: 'http://localhost:3000/api',
});

async function relatedSkillsExample() {
  console.log('🔗 获取相关技能...\n');

  try {
    // 替换为实际的skill ID
    const skillId = 'skill_123456';

    const related = await sdk.getRelatedSkills(skillId, {
      limit: 5,
      minSimilarity: 0.6,
    });

    console.log(`找到 ${related.length} 个相关技能\n`);

    related.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.name}`);
      console.log(`   描述: ${skill.description}`);
      console.log(`   相似度: ${(skill.similarity * 100).toFixed(1)}%`);
      console.log(`   分类: ${skill.category || 'N/A'}`);
      console.log(`   Stars: ${skill.starCount || 0}`);
      console.log('');
    });
  } catch (error) {
    console.error('获取相关技能失败:', error instanceof Error ? error.message : error);
  }
}

relatedSkillsExample();

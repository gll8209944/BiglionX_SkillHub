/**
 * 基础搜索示例
 */

import { SearchSDK } from '../src';

// 初始化SDK
const sdk = new SearchSDK({
  apiUrl: 'http://localhost:3000/api', // 替换为您的SkillHub实例URL
});

async function basicSearch() {
  console.log('🔍 执行基础搜索...\n');

  try {
    // 1. 关键词搜索
    const results = await sdk.search({
      query: 'python automation',
      page: 1,
      pageSize: 10,
      sortBy: 'relevance',
    });

    console.log(`找到 ${results.total} 个结果 (第 ${results.page}/${results.totalPages} 页)\n`);

    results.skills.forEach((skill, index) => {
      console.log(`${index + 1}. ${skill.name}`);
      console.log(`   描述: ${skill.description}`);
      console.log(`   分类: ${skill.category || 'N/A'}`);
      console.log(`   Stars: ${skill.starCount || 0}`);
      console.log(`   下载: ${skill.downloadCount || 0}`);
      console.log('');
    });
  } catch (error) {
    console.error('搜索失败:', error instanceof Error ? error.message : error);
  }
}

basicSearch();

/**
 * 语义搜索示例
 */

import { SearchSDK } from '../src';

const sdk = new SearchSDK({
  apiUrl: 'http://localhost:3000/api',
});

async function semanticSearchExample() {
  console.log('🧠 执行语义搜索...\n');

  try {
    // 语义搜索 - 理解查询意图，而不仅仅是关键词匹配
    const results = await sdk.semanticSearch({
      query: '如何自动化处理Excel文件',
      limit: 10,
      minSimilarity: 0.5,
    });

    console.log(`找到 ${results.length} 个相关结果\n`);

    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}`);
      console.log(`   描述: ${result.description}`);
      console.log(`   相似度: ${(result.similarity * 100).toFixed(1)}%`);
      console.log(`   分类: ${result.category || 'N/A'}`);
      console.log('');
    });
  } catch (error) {
    console.error('语义搜索失败:', error instanceof Error ? error.message : error);
  }
}

semanticSearchExample();

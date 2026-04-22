/**
 * 搜索建议和热门搜索示例
 */

import { SearchSDK } from '../src';

const sdk = new SearchSDK({
  apiUrl: 'http://localhost:3000/api',
});

async function suggestionsExample() {
  console.log('💡 获取搜索建议...\n');

  try {
    // 获取搜索建议（自动补全）
    const suggestions = await sdk.getSuggestions('pyt', 5);

    console.log('搜索建议：');
    suggestions.forEach((suggestion, index) => {
      console.log(`  ${index + 1}. ${suggestion.text} (${suggestion.type})`);
    });
    console.log('');

    // 获取热门搜索词
    const popular = await sdk.getPopularSearches(10);

    console.log('🔥 热门搜索词：');
    popular.forEach((term, index) => {
      console.log(`  ${index + 1}. ${term}`);
    });
  } catch (error) {
    console.error('获取建议失败:', error instanceof Error ? error.message : error);
  }
}

suggestionsExample();

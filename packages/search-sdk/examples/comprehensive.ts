/**
 * 综合示例 - 展示所有SDK功能
 */

import { SearchSDK } from '../src';

const sdk = new SearchSDK({
  apiUrl: 'http://localhost:3000/api',
});

async function comprehensiveExample() {
  console.log('🚀 SkillHub Search SDK 综合示例\n');
  console.log('='.repeat(60));

  // 1. 健康检查
  console.log('\n1️⃣  健康检查...');
  try {
    const isHealthy = await sdk.healthCheck();
    console.log(`   API状态: ${isHealthy ? '✅ 正常' : '❌ 异常'}`);
  } catch {
    console.log(`   API状态: ❌ 异常`);
  }

  // 2. 基础搜索
  console.log('\n2️⃣  基础搜索...');
  try {
    const results = await sdk.search({
      query: 'python',
      page: 1,
      pageSize: 5,
    });
    console.log(`   找到 ${results.total} 个结果`);
    if (results.skills.length > 0) {
      console.log(`   第一个结果: ${results.skills[0].name}`);
    }
  } catch (error) {
    console.log(`   错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  // 3. 语义搜索
  console.log('\n3️⃣  语义搜索...');
  try {
    const results = await sdk.semanticSearch({
      query: '自动化数据处理',
      limit: 3,
    });
    console.log(`   找到 ${results.length} 个相关结果`);
    if (results.length > 0) {
      console.log(`   最相关: ${results[0].name} (相似度: ${(results[0].similarity * 100).toFixed(1)}%)`);
    }
  } catch (error) {
    console.log(`   错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  // 4. 高级搜索
  console.log('\n4️⃣  高级搜索...');
  try {
    const results = await sdk.advancedSearch({
      categories: ['development'],
      languages: ['python'],
      minStars: 10,
      pageSize: 5,
    });
    console.log(`   找到 ${results.total} 个结果`);
  } catch (error) {
    console.log(`   错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  // 5. 搜索建议
  console.log('\n5️⃣  搜索建议...');
  try {
    const suggestions = await sdk.getSuggestions('py', 5);
    console.log(`   建议: ${suggestions.map(s => s.text).join(', ')}`);
  } catch (error) {
    console.log(`   错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  // 6. 热门搜索
  console.log('\n6️⃣  热门搜索...');
  try {
    const popular = await sdk.getPopularSearches(5);
    console.log(`   热门: ${popular.join(', ')}`);
  } catch (error) {
    console.log(`   错误: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✨ 示例完成！\n');
}

comprehensiveExample();

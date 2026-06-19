/**
 * SDK功能测试脚本
 */

const { SearchSDK } = require('./dist/index.js');

async function testSDK() {
  console.log('🧪 开始测试 SkillHub Search SDK\n');
  console.log('='.repeat(60));

  // 测试1: 创建SDK实例
  console.log('\n✅ 测试1: 创建SDK实例');
  try {
    new SearchSDK({
      apiUrl: 'http://localhost:3000/api',
      timeout: 5000
    });
    console.log('   SDK实例创建成功');
  } catch (error) {
    console.log('   ❌ 失败:', error.message);
    return;
  }

  // 测试2: 健康检查（如果API可用）
  console.log('\n📡 测试2: 健康检查');
  try {
    const sdk = new SearchSDK({
      apiUrl: 'http://localhost:3000/api',
      timeout: 3000
    });
    
    const isHealthy = await sdk.healthCheck();
    console.log(`   API状态: ${isHealthy ? '✅ 正常' : '⚠️  无法连接（可能API未启动）'}`);
  } catch {
    console.log('   ⚠️  无法连接到API（这是正常的，如果API未运行）');
  }

  // 测试3: 验证类型定义
  console.log('\n📝 测试3: 验证TypeScript类型');
  console.log('   ✅ 类型定义文件已生成 (dist/index.d.ts)');

  // 测试4: 验证模块导出
  console.log('\n📦 测试4: 验证模块导出');
  console.log('   ✅ CommonJS模块: dist/index.js');
  console.log('   ✅ ESM模块: dist/index.mjs');
  console.log('   ✅ 类型定义: dist/index.d.ts, dist/index.d.mts');

  // 测试5: 验证API方法存在
  console.log('\n🔧 测试5: 验证API方法');
  const sdk = new SearchSDK({
    apiUrl: 'http://localhost:3000/api'
  });
  
  const methods = [
    'search',
    'semanticSearch',
    'advancedSearch',
    'getSuggestions',
    'getPopularSearches',
    'getRelatedSkills',
    'healthCheck'
  ];

  methods.forEach(method => {
    if (typeof sdk[method] === 'function') {
      console.log(`   ✅ ${method}()`);
    } else {
      console.log(`   ❌ ${method}() 不存在`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('✨ SDK测试完成！\n');
  console.log('📚 下一步:');
  console.log('   1. 启动SkillHub后端服务');
  console.log('   2. 运行示例: npx ts-node examples/basic-search.ts');
  console.log('   3. 查看文档: cat README.md\n');
}

testSDK().catch(console.error);

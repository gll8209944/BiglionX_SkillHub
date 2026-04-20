const { OpenAI } = require('openai');

async function testDeepSeekEmbeddings() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';
  
  console.log('🔑 API Key:', apiKey ? apiKey.substring(0, 15) + '...' : '未设置');
  console.log('🌐 Base URL:', baseURL);
  console.log('');
  
  const client = new OpenAI({ 
    apiKey,
    baseURL,
    timeout: 30000,
    maxRetries: 3
  });
  
  // 先列出所有可用模型
  try {
    console.log('📋 查询可用模型...');
    const models = await client.models.list();
    console.log(`✅ 找到 ${models.data.length} 个模型:`);
    models.data.forEach(m => {
      console.log(`   - ${m.id}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ 获取模型列表失败:', error.message);
  }
  
  // 尝试不同的模型名称
  const modelNames = [
    'deepseek-embed',
    'deepseek-embed-large',
    'deepseek-chat',
  ];
  
  for (const modelName of modelNames) {
    console.log(`🧪 测试模型: ${modelName}`);
    try {
      const response = await client.embeddings.create({
        model: modelName,
        input: ['Hello, this is a test.'],
      });
      
      console.log(`✅ 成功!`);
      console.log(`   向量维度: ${response.data[0].embedding.length}`);
      console.log(`   前5个值: ${response.data[0].embedding.slice(0, 5).join(', ')}`);
      console.log('');
      return; // 成功后退出
      
    } catch (error) {
      console.error(`   ❌ 失败: ${error.status || error.code} - ${error.message}`);
    }
  }
  
  console.log('💡 建议:');
  console.log('   1. 检查API Key是否有Embeddings权限');
  console.log('   2. 查看DeepSeek文档确认正确的模型名称');
  console.log('   3. 联系DeepSeek支持确认您的账户是否开通了Embeddings服务');
}

testDeepSeekEmbeddings();

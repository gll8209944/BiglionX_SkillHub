// 测试OpenAI API连接
const { OpenAI } = require('openai');

async function testOpenAIConnection() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('🔑 API Key:', apiKey ? apiKey.substring(0, 10) + '...' : '未设置');
  console.log(' Key格式:', apiKey?.startsWith('sk-proj-') ? '标准格式 ✅' : '非标准格式 ⚠️');
  console.log('');
  
  const openai = new OpenAI({ 
    apiKey,
    timeout: 30000, // 30秒超时
    maxRetries: 2
  });
  
  try {
    console.log(' 测试连接 OpenAI API...');
    const models = await openai.models.list();
    console.log('✅ 连接成功！');
    console.log(`📊 可用模型数量: ${models.data.length}`);
    console.log(' 前5个模型:');
    models.data.slice(0, 5).forEach(m => {
      console.log(`   - ${m.id}`);
    });
    
    console.log('');
    console.log('🧪 测试Embeddings生成...');
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: 'Hello, this is a test.',
    });
    
    console.log('✅ Embeddings生成成功！');
    console.log(`📏 向量维度: ${embedding.data[0].embedding.length}`);
    console.log(`📊 前5个值: ${embedding.data[0].embedding.slice(0, 5).join(', ')}`);
    console.log(`💰 使用tokens: ${embedding.usage.total_tokens}`);
    
  } catch (error) {
    console.error('❌ 测试失败:');
    console.error(`   错误类型: ${error.constructor.name}`);
    console.error(`   错误信息: ${error.message}`);
    
    if (error.status) {
      console.error(`   HTTP状态: ${error.status}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('');
      console.error('💡 可能的原因:');
      console.error('   1. 需要配置代理访问OpenAI');
      console.error('   2. 网络防火墙阻止了访问');
      console.error('   3. API Key无效或已过期');
    }
    
    if (error.status === 401) {
      console.error('');
      console.error('💡 API Key无效，请检查:');
      console.error('   1. Key是否正确复制');
      console.error('   2. Key是否已过期');
      console.error('   3. 是否有足够的余额');
    }
    
    process.exit(1);
  }
}

testOpenAIConnection();

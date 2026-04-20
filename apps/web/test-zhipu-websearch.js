const OpenAI = require('openai');

async function testZhipuWebSearch() {
  const client = new OpenAI({
    apiKey: process.env.ZHIPU_API_KEY,
    baseURL: process.env.ZHIPU_BASE_URL,
    timeout: 30000,
  });

  console.log('🔍 测试智谱AI Web Search功能...');
  
  try {
    // 测试聊天功能
    console.log('\n💬 测试GLM-4.7-Flash聊天模型...');
    const chatResponse = await client.chat.completions.create({
      model: process.env.ZHIPU_MODEL || 'glm-4.7-flash',
      messages: [{ role: 'user', content: '你好，请介绍一下最新的AI技术趋势' }],
      stream: false,
    });
    
    console.log('✅ 聊天功能正常');
    console.log('🤖 回答:', chatResponse.choices[0]?.message?.content?.substring(0, 100) + '...');
    
    // 测试Embeddings功能
    console.log('\n🧮 测试Embeddings功能...');
    const embeddingResponse = await client.embeddings.create({
      model: process.env.ZHIPU_EMBEDDING_MODEL || 'embedding-2',
      input: '人工智能技术在2026年的最新发展',
    });
    
    console.log('✅ Embeddings功能正常');
    console.log('📊 向量维度:', embeddingResponse.data[0].embedding.length);
    console.log('🔢 前5个向量值:', embeddingResponse.data[0].embedding.slice(0, 5));
    
    // 测试Web Search功能
    console.log('\n🌐 测试Web Search功能...');
    const webSearchResponse = await client.chat.completions.create({
      model: process.env.ZHIPU_MODEL || 'glm-4.7-flash',
      messages: [{ role: 'user', content: '搜索2026年最新的人工智能技能趋势，并总结前3个最重要的' }],
      stream: false,
      tools: [{
        type: 'web_search',
        web_search: {
          enable: true,
          search_query: '2026年AI技能趋势'
        }
      }]
    });
    
    console.log('✅ Web Search功能正常');
    console.log('🔍 搜索结果:', webSearchResponse.choices[0]?.message?.content?.substring(0, 200) + '...');
    
    console.log('\n🎉 所有智谱AI功能测试通过！');
    console.log('📋 功能清单:');
    console.log('   - 聊天模型 (GLM-4): ✅ 可用');
    console.log('   - Embeddings (embedding-2): ✅ 可用');
    console.log('   - Web Search: ✅ 可用');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.status === 401) {
      console.error('🔑 API Key无效或已过期');
    } else if (error.status === 403) {
      console.error('🚫 API Key权限不足');
    } else if (error.status === 429) {
      console.error('⚡ 请求频率超限');
    } else {
      console.error('🐛 其他错误:', error);
    }
    throw error;
  }
}

testZhipuWebSearch();

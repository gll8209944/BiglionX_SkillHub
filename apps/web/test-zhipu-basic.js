const OpenAI = require('openai');

async function testZhipuBasic() {
  const client = new OpenAI({
    apiKey: process.env.ZHIPU_API_KEY,
    baseURL: process.env.ZHIPU_BASE_URL,
    timeout: 30000,
  });

  console.log('🔍 测试智谱AI基础功能...\n');
  
  try {
    // 测试聊天功能（降低频率）
    console.log('💬 测试GLM-4.7-Flash聊天模型...');
    setTimeout(async () => {
      try {
        const chatResponse = await client.chat.completions.create({
          model: process.env.ZHIPU_MODEL || 'glm-4.7-flash',
          messages: [{ role: 'user', content: '你好，简单介绍一下自己' }],
          stream: false,
        });
        
        console.log('✅ 聊天功能正常');
        console.log('🤖 回答:', chatResponse.choices[0]?.message?.content?.substring(0, 100) + '...\n');
        
        // 测试Embeddings功能
        console.log('🧮 测试Embeddings功能...');
        const embeddingResponse = await client.embeddings.create({
          model: process.env.ZHIPU_EMBEDDING_MODEL || 'embedding-2',
          input: '人工智能技术在2026年的最新发展',
        });
        
        console.log('✅ Embeddings功能正常');
        console.log('📊 向量维度:', embeddingResponse.data[0].embedding.length);
        console.log('🔢 前5个向量值:', embeddingResponse.data[0].embedding.slice(0, 5));
        
        console.log('\n🎉 智谱AI基础功能测试通过！');
        console.log('📋 已验证功能:');
        console.log('   - 聊天模型 (GLM-4.7-Flash): ✅ 可用');
        console.log('   - Embeddings (embedding-2): ✅ 可用');
        console.log('\n⚠️  注意: Web Search功能可能需要特殊权限或不同配置');
        
      } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.status === 429) {
          console.log('⏰ 触发速率限制，请稍后再试');
        }
      }
    }, 2000); // 等待2秒以避免频率限制
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testZhipuBasic();

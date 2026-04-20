const OpenAI = require('openai');

async function listZhipuModels() {
  const client = new OpenAI({
    apiKey: process.env.ZHIPU_API_KEY,
    baseURL: process.env.ZHIPU_BASE_URL,
  });

  console.log('📋 查询智谱AI可用模型...\n');
  
  try {
    const models = await client.models.list();
    
    console.log(`✅ 找到 ${models.data.length} 个模型:\n`);
    
    models.data.forEach((model, index) => {
      console.log(`${index + 1}. ${model.id}`);
      if (model.created) {
        console.log(`   创建时间: ${new Date(model.created * 1000).toLocaleDateString('zh-CN')}`);
      }
      console.log('');
    });
    
    // 检查常用模型是否存在
    const commonModels = [
      'glm-4',
      'glm-4-9b',
      'glm-4-flash',
      'glm-4-air',
      'glm-3-turbo',
      'embedding-2',
      'embedding-3',
      'cogview-3'
    ];
    
    console.log('\n🔍 检查常用模型:');
    commonModels.forEach(modelName => {
      const exists = models.data.some(m => m.id === modelName);
      console.log(`   ${modelName}: ${exists ? '✅ 可用' : '❌ 不可用'}`);
    });
    
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    throw error;
  }
}

listZhipuModels();

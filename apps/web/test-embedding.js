require('dotenv').config({ path: '.env.local' });

const { embeddingService } = require('./lib/services/EmbeddingService');

async function testEmbedding() {
  console.log('🧪 测试 EmbeddingService...\n');
  
  try {
    // 测试1: 生成单个embedding
    console.log('📝 测试1: 生成单个embedding');
    const text = 'AI Agent Skill for inventory management and warehouse optimization';
    console.log(`文本: ${text}`);
    
    const embedding = await embeddingService.generateEmbedding(text);
    console.log(`✅ Embedding生成成功`);
    console.log(`   维度: ${embedding.length}`);
    console.log(`   前5个值: [${embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]\n`);
    
    // 测试2: 为Skill生成embedding
    console.log('📦 测试2: 为Skill生成embedding');
    const skillData = {
      name: 'Inventory Manager',
      description: 'Manage inventory levels and automate reordering',
      tags: ['inventory', 'warehouse', 'automation'],
      category: 'Business',
      readme: 'This skill helps manage inventory...',
    };
    
    const skillEmbedding = await embeddingService.generateSkillEmbedding(skillData);
    console.log(`✅ Skill Embedding生成成功`);
    console.log(`   维度: ${skillEmbedding.length}\n`);
    
    // 测试3: 计算相似度
    console.log('🔍 测试3: 计算相似度');
    const text2 = 'Warehouse inventory control system';
    const embedding2 = await embeddingService.generateEmbedding(text2);
    
    const similarity = embeddingService.calculateSimilarity(embedding, embedding2);
    console.log(`文本1: "${text}"`);
    console.log(`文本2: "${text2}"`);
    console.log(`✅ 相似度: ${similarity.toFixed(4)} (0-1范围)\n`);
    
    // 测试4: 批量生成
    console.log('📚 测试4: 批量生成embeddings');
    const texts = [
      'AI chatbot for customer service',
      'Data analysis and visualization tool',
      'Code generation assistant',
    ];
    
    const batchEmbeddings = await embeddingService.batchGenerateEmbeddings(texts);
    console.log(`✅ 批量生成成功`);
    console.log(`   数量: ${batchEmbeddings.length}`);
    console.log(`   每个维度: ${batchEmbeddings[0].length}\n`);
    
    console.log('✨ 所有测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.message.includes('OPENAI_API_KEY')) {
      console.error('\n⚠️  请确保在 .env.local 中设置了有效的 OPENAI_API_KEY');
      console.error('   获取API Key: https://platform.openai.com/api-keys');
    }
    process.exit(1);
  }
}

testEmbedding();

// 为现有Skills批量生成Embeddings
require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const { embeddingService } = require('../lib/services/EmbeddingService');

const prisma = new PrismaClient();

async function generateEmbeddingsForSkills() {
  console.log('🚀 开始为Skills批量生成Embeddings...\n');
  
  try {
    // 获取所有Skills
    console.log('📊 查询数据库中的Skills...');
    const skills = await prisma.skill.findMany({
      where: {
        status: 'active', // 只处理活跃的Skills
      },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        category: true,
        readme: true,
        embedding: true, // 检查是否已有embedding
      },
      take: 50, // 先处理前50个作为测试
    });
    
    console.log(`✅ 找到 ${skills.length} 个Skills\n`);
    
    // 过滤掉已有embedding的Skills
    const skillsToProcess = skills.filter(skill => !skill.embedding);
    console.log(`📝 需要处理的Skills: ${skillsToProcess.length} 个\n`);
    
    if (skillsToProcess.length === 0) {
      console.log('✨ 所有Skills都已有Embeddings，无需处理');
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // 逐个处理（避免速率限制）
    for (let i = 0; i < skillsToProcess.length; i++) {
      const skill = skillsToProcess[i];
      
      try {
        console.log(`[${i + 1}/${skillsToProcess.length}] 处理: ${skill.name}`);
        
        // 生成Skill的Embedding
        const embedding = await embeddingService.generateSkillEmbedding({
          name: skill.name,
          description: skill.description || '',
          tags: skill.tags || [],
          category: skill.category || '',
          readme: skill.readme || '',
        });
        
        // 更新数据库
        await prisma.skill.update({
          where: { id: skill.id },
          data: {
            embedding: embedding, // 存储为JSON数组
          },
        });
        
        successCount++;
        console.log(`   ✅ 成功 - 维度: ${embedding.length}\n`);
        
        // 添加延迟以避免速率限制（智谱AI需要3秒间隔）
        if (i < skillsToProcess.length - 1) {
          console.log('   ⏰ 等待3秒以避免速率限制...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
      } catch (error) {
        failCount++;
        console.error(`   ❌ 失败: ${error.message}\n`);
        
        // 如果是速率限制错误，等待更长时间
        if (error.message.includes('429') || error.message.includes('速率限制')) {
          console.log('   ⚠️ 触发速率限制，等待60秒...');
          await new Promise(resolve => setTimeout(resolve, 60000));
        }
      }
    }
    
    // 输出统计
    console.log('\n' + '='.repeat(60));
    console.log('📊 处理完成统计:');
    console.log('='.repeat(60));
    console.log(`总处理数量: ${skillsToProcess.length}`);
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失败: ${failCount}`);
    console.log(`⏳ 跳过（已有embedding）: ${skills.length - skillsToProcess.length}`);
    console.log('='.repeat(60));
    
    if (failCount > 0) {
      console.log('\n⚠️  部分Skills处理失败，可以稍后重试');
    } else {
      console.log('\n🎉 所有Skills处理成功！');
    }
    
  } catch (error) {
    console.error('❌ 批量处理失败:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 运行脚本
generateEmbeddingsForSkills().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});

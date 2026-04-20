/**
 * 自动化抓取脚本 - 抓取至少500个热门Skills
 * 
 * 使用方法:
 * npx tsx scripts/auto-crawl-skills.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { CrawlerService } from '../apps/web/lib/services/CrawlerService';
import { prisma } from '../apps/web/lib/prisma';

// 加载环境变量
config({ path: resolve(__dirname, '../apps/web/.env.local') });

async function autoCrawlSkills() {
  console.log('🚀 Starting automated skill crawling...\n');
  
  const crawlerService = new CrawlerService();
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  try {
    // ==========================================
    // Step 1: 从 SkillsMP 导入 trending skills
    // ==========================================
    console.log('📥 Step 1: Importing trending skills from SkillsMP...');
    
    try {
      // 获取 trending skills（由于没有真实 API key，这里会失败，我们跳过）
      console.log('⚠️  Skipping SkillsMP (need valid API key)');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`⚠️  SkillsMP import skipped: ${errorMessage}`);
    }
    
    // ==========================================
    // Step 2: 从 GitHub 搜索并爬取 AI Agent Skills
    // ==========================================
    console.log('\n🕷️  Step 2: Crawling AI Agent Skills from GitHub...');
    
    const searchQueries = [
      { query: 'skill.md', filters: { minStars: 50, limit: 100 } },
      { query: 'agent skill', filters: { minStars: 30, limit: 80 } },
      { query: 'ai tool', filters: { minStars: 50, limit: 80 } },
      { query: 'llm framework', filters: { minStars: 50, limit: 60 } },
      { query: 'autonomous', filters: { minStars: 30, limit: 60 } },
      { query: 'chatbot', filters: { minStars: 50, limit: 50 } },
      { query: 'langchain', filters: { minStars: 30, limit: 50 } },
      { query: 'openai', filters: { minStars: 50, limit: 50 } },
      { query: 'gpt', filters: { minStars: 50, limit: 40 } },
      { query: 'rag', filters: { minStars: 30, limit: 40 } },
      { query: 'claude', filters: { minStars: 30, limit: 40 } },
      { query: 'copilot', filters: { minStars: 50, limit: 40 } },
      { query: 'ai assistant', filters: { minStars: 30, limit: 40 } },
      { query: 'mcp', filters: { minStars: 20, limit: 40 } },
      { query: 'ai agent', filters: { minStars: 30, limit: 40 } },
      { query: 'cursor', filters: { minStars: 50, limit: 30 } },
      { query: 'windsurf', filters: { minStars: 30, limit: 30 } },
      { query: 'cline', filters: { minStars: 30, limit: 30 } },
      { query: 'roo code', filters: { minStars: 20, limit: 30 } },
    ];
    
    for (const { query, filters } of searchQueries) {
      console.log(`\n🔍 Searching: "${query}" (min stars: ${filters.minStars}, limit: ${filters.limit})`);
      
      try {
        const result = await crawlerService.searchAndCrawl(query, filters);
        
        console.log(`   ✓ Discovered: ${result.discovered}`);
        console.log(`   ✓ Crawled: ${result.crawled}`);
        console.log(`   ✗ Failed: ${result.failed}`);
        
        totalSuccess += result.crawled;
        totalFailed += result.failed;
        
        // 如果已经达到目标，提前退出
        if (totalSuccess >= 500) {
          console.log('\n✅ Target reached! Stopping early.');
          break;
        }
        
        // 避免速率限制
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ❌ Search failed: ${errorMessage}`);
        totalFailed++;
      }
    }
    
    // ==========================================
    // Step 3: 爬取知名的种子仓库
    // ==========================================
    console.log('\n🌱 Step 3: Crawling seed repositories...');
    
    const seedRepos = [
      'microsoft/autogen',
      'langchain-ai/langchain',
      'run-llama/llama_index',
      'crewAIInc/crewAI',
      'danny-avila/LibreChat',
      'open-webui/open-webui',
      'FlowiseAI/Flowise',
      'Significant-Gravitas/AutoGPT',
      'NVIDIA/NeMo-Guardrails',
      'vanna-ai/vanna',
      'e2b-dev/e2b',
      'ComposioHQ/composio',
      'letta-ai/letta',
      'superagent-ai/superagent',
      'lobehub/lobe-chat',
    ];
    
    console.log(`Crawling ${seedRepos.length} seed repositories...`);
    
    try {
      const seedResult = await crawlerService.crawlBatchAndSave(seedRepos);
      console.log(`   ✓ Success: ${seedResult.success}`);
      console.log(`   ✗ Failed: ${seedResult.failed}`);
      
      totalSuccess += seedResult.success;
      totalFailed += seedResult.failed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`   ❌ Seed crawl failed: ${errorMessage}`);
    }
    
    // ==========================================
    // Step 4: 统计结果
    // ==========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 CRAWLING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Successfully Crawled: ${totalSuccess}`);
    console.log(`Total Failed: ${totalFailed}`);
    console.log(`Target: 500 skills`);
    console.log(`Status: ${totalSuccess >= 500 ? '✅ TARGET REACHED' : '⚠️  Below target'}`);
    console.log('='.repeat(60));
    
    // ==========================================
    // Step 5: 验证数据库中的数据
    // ==========================================
    console.log('\n🔍 Verifying database...');
    
    const totalCount = await prisma.skill.count();
    const externalSourceCount = await prisma.skill.count({
      where: {
        source: { not: null }
      }
    });
    const skillsmpCount = await prisma.skill.count({
      where: { source: 'skillsmp' }
    });
    const githubCount = await prisma.skill.count({
      where: { source: 'github' }
    });
    
    console.log('\n📈 Database Statistics:');
    console.log(`   Total Skills: ${totalCount}`);
    console.log(`   External Source Skills: ${externalSourceCount}`);
    console.log(`   - From SkillsMP: ${skillsmpCount}`);
    console.log(`   - From GitHub: ${githubCount}`);
    
    // 显示最新的 10 个 skills
    const recentSkills = await prisma.skill.findMany({
      where: {
        source: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        source: true,
        qualityScore: true,
        starCount: true,
        createdAt: true,
      }
    });
    
    console.log('\n🆕 Recent External Skills:');
    recentSkills.forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.name} (${skill.source}) - Stars: ${skill.starCount}, Quality: ${skill.qualityScore}`);
    });
    
    // ==========================================
    // Step 6: 检查同步日志
    // ==========================================
    console.log('\n📋 Sync Logs:');
    const syncLogs = await prisma.syncLog.findMany({
      orderBy: { startedAt: 'desc' },
      take: 5,
    });
    
    if (syncLogs.length > 0) {
      syncLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.source} - Status: ${log.status}, Success: ${log.successCount}, Failed: ${log.failedCount}`);
      });
    } else {
      console.log('   No sync logs found.');
    }
    
    console.log('\n✅ Automated crawling completed!\n');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    console.error('\n❌ Fatal error:', errorMessage);
    console.error(errorStack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 执行
autoCrawlSkills().catch(console.error);

/**
 * 仅使用 GitHub 的自动化抓取脚本
 * 不需要 SkillsMP API Key
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { CrawlerService } from '../apps/web/lib/services/CrawlerService';
import { prisma } from '../apps/web/lib/prisma';

// 加载环境变量
config({ path: resolve(__dirname, '../apps/web/.env.local') });

async function crawlFromGitHub() {
  console.log('🚀 Starting GitHub-only skill crawling...\n');
  
  // 检查 GitHub Token
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken || githubToken.includes('placeholder')) {
    console.error('❌ ERROR: GITHUB_TOKEN not configured!');
    console.error('Please add your GitHub token to .env.local:');
    console.error('GITHUB_TOKEN=ghp_your_real_token_here');
    console.error('\nGet token from: https://github.com/settings/tokens');
    process.exit(1);
  }
  
  console.log('✅ GitHub Token configured');
  console.log(`   Token prefix: ${githubToken.substring(0, 8)}...`);
  
  const crawlerService = new CrawlerService();
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  try {
    // ==========================================
    // Step 1: 爬取知名种子仓库
    // ==========================================
    console.log('\n🌱 Step 1: Crawling seed repositories...');
    
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
      'haystack-ai/haystack',
      'semantic-kernel/semantic-kernel',
      'llmware-ai/llmware',
      'julep-ai/julep',
    ];
    
    console.log(`Crawling ${seedRepos.length} seed repositories...`);
    
    try {
      const seedResult = await crawlerService.crawlBatchAndSave(seedRepos);
      console.log(`   ✅ Success: ${seedResult.success}`);
      console.log(`   ❌ Failed: ${seedResult.failed}`);
      
      totalSuccess += seedResult.success;
      totalFailed += seedResult.failed;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`   ❌ Seed crawl failed: ${errorMessage}`);
    }
    
    // 等待一下避免速率限制
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ==========================================
    // Step 2: 搜索并爬取更多 repos
    // ==========================================
    console.log('\n🔍 Step 2: Searching and crawling from GitHub...');
    
    const searchQueries = [
      { query: 'AI agent skill', filters: { minStars: 50, limit: 25 } },
      { query: 'LLM tool framework', filters: { minStars: 40, limit: 25 } },
      { query: 'autonomous agent', filters: { minStars: 30, limit: 20 } },
      { query: 'AI assistant', filters: { minStars: 50, limit: 20 } },
      { query: 'langchain tool', filters: { minStars: 50, limit: 15 } },
    ];
    
    for (const { query, filters } of searchQueries) {
      console.log(`\n   Searching: "${query}" (min stars: ${filters.minStars}, limit: ${filters.limit})`);
      
      try {
        const result = await crawlerService.searchAndCrawl(query, filters);
        
        console.log(`   ✓ Discovered: ${result.discovered}`);
        console.log(`   ✓ Crawled: ${result.crawled}`);
        console.log(`   ✗ Failed: ${result.failed}`);
        
        totalSuccess += result.crawled;
        totalFailed += result.failed;
        
        // 如果已经达到目标，提前退出
        if (totalSuccess >= 100) {
          console.log('\n   🎯 Target reached! Stopping early.');
          break;
        }
        
        // 避免速率限制
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ❌ Search failed: ${errorMessage}`);
        totalFailed++;
      }
    }
    
    // ==========================================
    // Step 3: 统计结果
    // ==========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 CRAWLING SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Successfully Crawled: ${totalSuccess}`);
    console.log(`Total Failed: ${totalFailed}`);
    console.log(`Target: 100 skills`);
    console.log(`Status: ${totalSuccess >= 100 ? '✅ TARGET REACHED' : '⚠️  Below target'}`);
    console.log('='.repeat(60));
    
    // ==========================================
    // Step 4: 验证数据库中的数据
    // ==========================================
    console.log('\n🔍 Verifying database...');
    
    const totalCount = await prisma.skill.count();
    const githubCount = await prisma.skill.count({
      where: { source: 'github' }
    });
    
    console.log('\n📈 Database Statistics:');
    console.log(`   Total Skills: ${totalCount}`);
    console.log(`   From GitHub: ${githubCount}`);
    
    // 显示最新的 10 个 skills
    const recentSkills = await prisma.skill.findMany({
      where: { source: 'github' },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        source: true,
        qualityScore: true,
        starCount: true,
        repositoryUrl: true,
        createdAt: true,
      }
    });
    
    console.log('\n🆕 Recent GitHub Skills:');
    recentSkills.forEach((skill, index) => {
      console.log(`   ${index + 1}. ${skill.name}`);
      console.log(`      Stars: ${skill.starCount}, Quality: ${skill.qualityScore}/100`);
      console.log(`      URL: ${skill.repositoryUrl}`);
    });
    
    console.log('\n✅ GitHub crawling completed!\n');
    console.log('💡 Next: Visit http://localhost:3000 to see the skills on homepage');
    
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
crawlFromGitHub().catch(console.error);

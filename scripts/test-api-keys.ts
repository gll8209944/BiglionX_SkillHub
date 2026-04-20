/**
 * 测试 API Keys 配置
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import axios from 'axios';

// 加载环境变量
config({ path: resolve(__dirname, '../apps/web/.env.local') });

async function testAPIKeys() {
  console.log('🔑 Testing API Keys Configuration\n');
  console.log('='.repeat(60));
  
  // Test GitHub Token
  console.log('\n1️⃣  Testing GitHub Token...');
  const githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken || githubToken.includes('placeholder')) {
    console.log('   ❌ GITHUB_TOKEN not configured or using placeholder');
    console.log('   ℹ️  Please update .env.local with your real GitHub token');
  } else {
    try {
      const response = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      
      console.log('   ✅ GitHub Token is valid!');
      console.log(`   👤 User: ${response.data.login}`);
      console.log(`   📊 Rate Limit: ${response.headers['x-ratelimit-remaining']}/${response.headers['x-ratelimit-limit']} requests remaining`);
    } catch (error) {
      const axiosError = error as { response?: { status: number }; message: string };
      if (axiosError.response?.status === 401) {
        console.log('   ❌ GitHub Token is invalid or expired');
      } else if (axiosError.response?.status === 403) {
        console.log('   ❌ GitHub Token lacks required permissions');
        console.log('   ℹ️  Make sure to grant "public_repo" scope');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`   ❌ Error: ${errorMessage}`);
      }
    }
  }
  
  // Test SkillsMP API Key
  console.log('\n2️⃣  Testing SkillsMP API Key...');
  const skillsmpKey = process.env.SKILLSMP_API_KEY;
  
  if (!skillsmpKey || skillsmpKey.includes('placeholder') || skillsmpKey === 'test-key-placeholder') {
    console.log('   ⚠️  SKILLSMP_API_KEY not configured (using placeholder)');
    console.log('   ℹ️  This is optional - GitHub crawler will still work');
    console.log('   ℹ️  To get a key: https://skillsmp.com/signup');
  } else {
    try {
      const response = await axios.get('https://api.skillsmp.com/v1/skills/trending', {
        headers: {
          'X-API-Key': skillsmpKey,
        },
        params: {
          limit: 1,
        },
      });
      
      console.log('   ✅ SkillsMP API Key is valid!');
      console.log(`   📊 Found ${response.data.data?.length || 0} trending skills`);
    } catch (error) {
      const axiosError = error as { response?: { status: number }; message: string };
      if (axiosError.response?.status === 401) {
        console.log('   ❌ SkillsMP API Key is invalid');
      } else if (axiosError.response?.status === 403) {
        console.log('   ❌ SkillsMP API Key lacks permissions or rate limited');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`   ⚠️  SkillsMP API may be unavailable: ${errorMessage}`);
        console.log('   ℹ️  This is okay - you can still use GitHub crawler');
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  
  const githubValid = githubToken && !githubToken.includes('placeholder');
  const skillsmpValid = skillsmpKey && !skillsmpKey.includes('placeholder') && skillsmpKey !== 'test-key-placeholder';
  
  if (githubValid) {
    console.log('✅ GitHub Token: Configured');
  } else {
    console.log('❌ GitHub Token: NOT configured (REQUIRED for crawling)');
  }
  
  if (skillsmpValid) {
    console.log('✅ SkillsMP Key: Configured');
  } else {
    console.log('⚠️  SkillsMP Key: Not configured (Optional)');
  }
  
  console.log('\n💡 Next Steps:');
  if (!githubValid) {
    console.log('   1. Get GitHub token: https://github.com/settings/tokens');
    console.log('   2. Update GITHUB_TOKEN in .env.local');
    console.log('   3. Restart dev server: npm run dev');
  } else {
    console.log('   ✅ Ready to crawl! Run: npx tsx scripts/auto-crawl-skills.ts');
  }
  
  console.log('='.repeat(60));
}

testAPIKeys().catch(console.error);

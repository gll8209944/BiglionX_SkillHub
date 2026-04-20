/**
 * 测试搜索系统
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import axios from 'axios';

// 加载环境变量
config({ path: resolve(__dirname, '../apps/web/.env.local') });

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function testSearchAPI() {
  console.log('🔍 Testing Search API\n');
  console.log('='.repeat(60));

  // Test 1: 基本搜索
  console.log('\n1️⃣  Test: Basic Search');
  try {
    const response = await axios.get(`${BASE_URL}/api/search`, {
      params: {
        q: 'ai',
        page: 1,
        pageSize: 5,
      },
    });

    console.log('   ✅ Search successful');
    console.log(`   📊 Total results: ${response.data.total}`);
    console.log(`   📄 Page: ${response.data.page}/${response.data.totalPages}`);
    console.log(`   📝 Results: ${response.data.skills.length} skills`);
    
    if (response.data.skills.length > 0) {
      const firstSkill = response.data.skills[0];
      console.log(`   🔹 First result: ${firstSkill.name}`);
      console.log(`   🔹 Quality Score: ${firstSkill.qualityScore}/100`);
    }
  } catch (error) {
    const axiosError = error as { response?: { status: number; data: any }; message: string };
    if (axiosError.response) {
      console.log(`   ❌ Search failed: ${axiosError.response.status}`);
      console.log(`   💬 Error: ${JSON.stringify(axiosError.response.data)}`);
    } else {
      console.log(`   ⚠️  Server not running or network error`);
      console.log(`   ℹ️  Start dev server: npm run dev`);
    }
  }

  // Test 2: 分类过滤搜索
  console.log('\n2️⃣  Test: Category Filter');
  try {
    const response = await axios.get(`${BASE_URL}/api/search`, {
      params: {
        category: 'development',
        page: 1,
        pageSize: 3,
      },
    });

    console.log('   ✅ Category filter successful');
    console.log(`   📊 Total in category: ${response.data.total}`);
    console.log(`   📝 Results: ${response.data.skills.length} skills`);
  } catch (error) {
    const axiosError = error as { response?: { status: number; data: any }; message: string };
    if (axiosError.response) {
      console.log(`   ❌ Filter failed: ${axiosError.response.status}`);
    } else {
      console.log(`   ⚠️  Server not running`);
    }
  }

  // Test 3: 搜索建议
  console.log('\n3️⃣  Test: Search Suggestions');
  try {
    const response = await axios.get(`${BASE_URL}/api/search/suggestions`, {
      params: {
        q: 'ai',
        limit: 5,
      },
    });

    console.log('   ✅ Suggestions retrieved');
    console.log(`   💡 Suggestions: ${response.data.suggestions.length}`);
    response.data.suggestions.forEach((s: any, i: number) => {
      console.log(`      ${i + 1}. ${s.text} (${s.type})`);
    });
  } catch (error) {
    const axiosError = error as { response?: { status: number; data: any }; message: string };
    if (axiosError.response) {
      console.log(`   ❌ Suggestions failed: ${axiosError.response.status}`);
    } else {
      console.log(`   ⚠️  Server not running`);
    }
  }

  // Test 4: 热门搜索
  console.log('\n4️⃣  Test: Popular Searches');
  try {
    const response = await axios.get(`${BASE_URL}/api/search/popular`, {
      params: {
        limit: 10,
      },
    });

    console.log('   ✅ Popular searches retrieved');
    console.log(`   🔥 Popular terms: ${response.data.popularSearches.length}`);
    response.data.popularSearches.forEach((term: string, i: number) => {
      console.log(`      ${i + 1}. ${term}`);
    });
  } catch (error) {
    const axiosError = error as { response?: { status: number; data: any }; message: string };
    if (axiosError.response) {
      console.log(`   ❌ Popular searches failed: ${axiosError.response.status}`);
    } else {
      console.log(`   ⚠️  Server not running`);
    }
  }

  // Test 5: 高级搜索（POST）
  console.log('\n5️⃣  Test: Advanced Search (POST)');
  try {
    const response = await axios.post(`${BASE_URL}/api/search`, {
      query: 'agent',
      minQualityScore: 50,
      page: 1,
      pageSize: 5,
    });

    console.log('   ✅ Advanced search successful');
    console.log(`   📊 Total results: ${response.data.total}`);
    console.log(`   📝 Results: ${response.data.skills.length} skills`);
  } catch (error) {
    const axiosError = error as { response?: { status: number; data: any }; message: string };
    if (axiosError.response) {
      console.log(`   ❌ Advanced search failed: ${axiosError.response.status}`);
    } else {
      console.log(`   ⚠️  Server not running`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  console.log('✅ Search API endpoints created:');
  console.log('   - GET  /api/search');
  console.log('   - POST /api/search');
  console.log('   - GET  /api/search/suggestions');
  console.log('   - GET  /api/search/popular');
  console.log('\n💡 Next Steps:');
  console.log('   1. Ensure dev server is running: npm run dev');
  console.log('   2. Test APIs in browser or Postman');
  console.log('   3. Implement frontend search UI');
  console.log('='.repeat(60));
}

testSearchAPI().catch(console.error);

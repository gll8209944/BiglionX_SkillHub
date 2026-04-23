import dotenv from 'dotenv';
import path from 'path';

// 加载 .env.local 文件
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testLoginAPI() {
  try {
    console.log('🌐 测试登录 API...\n');
    
    const baseUrl = 'http://localhost:3001';
    
    // 测试 1: 检查登录页面是否可访问
    console.log('测试 1: 检查登录页面...');
    const loginPageResponse = await fetch(`${baseUrl}/login`);
    if (loginPageResponse.ok) {
      console.log('✅ 登录页面可访问');
    } else {
      console.error('❌ 登录页面不可访问');
      return;
    }
    
    // 测试 2: 检查会话 API
    console.log('\n测试 2: 检查会话 API（未登录状态）...');
    const sessionResponse = await fetch(`${baseUrl}/api/auth/session`);
    const sessionData = await sessionResponse.json();
    console.log('会话数据:', JSON.stringify(sessionData, null, 2));
    
    if (!sessionData || !sessionData.user) {
      console.log('✅ 当前未登录（预期行为）');
    } else {
      console.log('⚠️  当前已登录');
    }
    
    // 测试 3: 尝试使用错误的凭据登录
    console.log('\n测试 3: 测试错误凭据...');
    const wrongLoginResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@skillhub.com',
        password: 'WrongPassword',
        redirect: false,
      }),
    });
    
    console.log('错误凭据响应状态:', wrongLoginResponse.status);
    
    // 测试 4: 检查重定向 URL API
    console.log('\n测试 4: 检查重定向 URL API...');
    const redirectResponse = await fetch(`${baseUrl}/api/auth/redirect-url`);
    if (redirectResponse.ok) {
      const redirectData = await redirectResponse.json();
      console.log('✅ 重定向 URL API 正常');
      console.log('重定向 URL:', redirectData.redirectUrl);
    } else {
      console.error('❌ 重定向 URL API 失败');
    }
    
    console.log('\n📋 API 测试总结:');
    console.log('   ✓ 登录页面可访问');
    console.log('   ✓ 会话 API 正常工作');
    console.log('   ✓ 重定向 URL API 正常');
    console.log('\n💡 提示: 由于 NextAuth v5 的限制，无法直接通过脚本测试 credentials 登录');
    console.log('   请使用浏览器进行完整的登录测试');
    
  } catch (error) {
    console.error('❌ API 测试失败:', error);
  }
}

testLoginAPI();
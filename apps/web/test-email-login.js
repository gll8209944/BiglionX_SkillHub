/**
 * 邮箱登录功能测试脚本
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEmailRegistration() {
  console.log('\n📝 测试1: 邮箱注册');
  const testData = {
    email: `test_${Date.now()}@example.com`,
    password: 'Test1234',
    name: '测试用户',
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/register`,
      testData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (response.status === 201) {
      console.log('✅ 注册成功');
      console.log('   用户ID:', response.data.user.id);
      console.log('   邮箱:', response.data.user.email);
      return testData;
    }
  } catch (error) {
    console.log('❌ 注册失败');
    if (error.response) {
      console.log('   状态码:', error.response.status);
      console.log('   错误信息:', error.response.data.error);
    }
  }
  return null;
}

async function testInvalidEmail() {
  console.log('\n🚫 测试2: 无效邮箱验证');
  const testData = {
    email: 'invalid-email',
    password: 'Test1234',
    name: '无效邮箱用户',
  };

  try {
    await axios.post(
      `${BASE_URL}/api/auth/register`,
      testData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('❌ 应该拒绝无效邮箱');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ 正确拒绝无效邮箱');
      console.log('   错误信息:', error.response.data.error);
    }
  }
}

async function testWeakPassword() {
  console.log('\n🔒 测试3: 弱密码验证');
  const testData = {
    email: `test_weak_${Date.now()}@example.com`,
    password: '123',
    name: '弱密码用户',
  };

  try {
    await axios.post(
      `${BASE_URL}/api/auth/register`,
      testData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('❌ 应该拒绝弱密码');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ 正确拒绝弱密码');
      console.log('   错误信息:', error.response.data.error);
    }
  }
}

async function runTests() {
  console.log('=' .repeat(60));
  console.log('🧪 SkillHub 邮箱登录功能测试');
  console.log('=' .repeat(60));

  // 测试 1: 邮箱注册
  await testEmailRegistration();
  
  // 等待一下，确保数据库操作完成
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 测试 2: 无效邮箱验证
  await testInvalidEmail();

  // 测试 3: 弱密码验证
  await testWeakPassword();

  console.log('\n' + '='.repeat(60));
  console.log('📊 测试完成');
  console.log('='.repeat(60));
  console.log('\n📋 下一步: 浏览器手动测试');
  console.log('1. 访问 http://localhost:3001/login');
  console.log('2. 切换到"邮箱登录"标签');
  console.log('3. 使用注册的邮箱和密码登录');
  console.log('4. 验证是否成功跳转到 Dashboard');
}

// 运行测试
runTests().catch(error => {
  console.error('\n💥 测试执行出错:', error);
  process.exit(1);
});

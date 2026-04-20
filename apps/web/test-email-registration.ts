/**
 * 邮箱注册和登录功能测试脚本
 * 
 * 使用方法:
 * npx tsx test-email-registration.ts
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

// 测试数据
const testData = {
  email: `test_${Date.now()}@example.com`,
  password: 'Test1234',
  name: '测试用户',
};

console.log('🧪 开始测试邮箱注册和登录功能...\n');
console.log('测试邮箱:', testData.email);
console.log('测试密码:', testData.password);
console.log('---\n');

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testEmailRegistration(): Promise<boolean> {
  try {
    // 测试 1: 注册新用户
    console.log('📝 测试 1: 注册新用户...');
    const registerResponse = await axios.post(
      `${BASE_URL}/api/auth/register`,
      {
        email: testData.email,
        password: testData.password,
        name: testData.name,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (registerResponse.status === 201) {
      console.log('✅ 注册成功');
      console.log('   用户ID:', registerResponse.data.user.id);
      console.log('   邮箱:', registerResponse.data.user.email);
      console.log('   姓名:', registerResponse.data.user.name);
    } else {
      console.log('❌ 注册失败:', registerResponse.data);
      return false;
    }

    await sleep(1000);

    // 测试 2: 尝试重复注册
    console.log('\n🔄 测试 2: 尝试重复注册...');
    try {
      await axios.post(
        `${BASE_URL}/api/auth/register`,
        {
          email: testData.email,
          password: testData.password,
          name: testData.name,
        }
      );
      console.log('❌ 应该拒绝重复注册');
      return false;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 409) {
        console.log('✅ 正确拒绝重复注册');
        console.log('   错误信息:', error.response.data.error);
      } else {
        console.log('⚠️  意外错误:', error instanceof Error ? error.message : String(error));
      }
    }

    await sleep(1000);

    // 测试 3: 使用错误密码登录（需要手动测试，因为 NextAuth 的 credentials provider）
    console.log('\n🔐 测试 3: 验证密码存储...');
    console.log('ℹ️  提示: 由于 NextAuth 的工作方式，需要通过浏览器测试实际登录');
    console.log('   请打开浏览器访问: http://localhost:3000/register');
    console.log('   然后切换到"邮箱注册"标签进行测试\n');

    // 测试 4: 验证弱密码被拒绝
    console.log('🛡️  测试 4: 验证弱密码被拒绝...');
    try {
      await axios.post(
        `${BASE_URL}/api/auth/register`,
        {
          email: `test_weak_${Date.now()}@example.com`,
          password: '123', // 太短
          name: 'Weak User',
        }
      );
      console.log('❌ 应该拒绝弱密码');
      return false;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
        console.log('✅ 正确拒绝弱密码');
        console.log('   错误信息:', error.response.data.error);
      }
    }

    await sleep(1000);

    // 测试 5: 验证无效邮箱被拒绝
    console.log('\n📧 测试 5: 验证无效邮箱被拒绝...');
    try {
      await axios.post(
        `${BASE_URL}/api/auth/register`,
        {
          email: 'invalid-email',
          password: testData.password,
          name: 'Invalid Email User',
        }
      );
      console.log('❌ 应该拒绝无效邮箱');
      return false;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
        console.log('✅ 正确拒绝无效邮箱');
        console.log('   错误信息:', error.response.data.error);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 API 层面测试完成！');
    console.log('='.repeat(50));
    console.log('\n📋 下一步: 浏览器手动测试');
    console.log('1. 访问 http://localhost:3000/register');
    console.log('2. 切换到"邮箱注册"标签');
    console.log('3. 填写表单:');
    console.log(`   - 邮箱: ${testData.email}`);
    console.log(`   - 密码: ${testData.password}`);
    console.log('4. 点击"创建账户"');
    console.log('5. 验证是否自动登录并跳转到 Dashboard');
    console.log('6. 退出登录后，使用相同凭据重新登录');
    console.log('\n✨ 所有自动化测试通过！');
    
    return true;
  } catch (error) {
    console.error('\n❌ 测试失败:', error instanceof Error ? error.message : String(error));
    if (axios.isAxiosError(error) && error.response) {
      console.error('   状态码:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
    return false;
  }
}

// 运行测试
testEmailRegistration().then(success => {
  process.exit(success ? 0 : 1);
});

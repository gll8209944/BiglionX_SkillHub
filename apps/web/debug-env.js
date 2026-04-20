// 调试环境变量加载
require('dotenv').config({ path: '.env.local' });

console.log('🔍 调试环境变量加载...\n');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '已设置 (' + process.env.OPENAI_API_KEY.substring(0, 10) + '...)' : '未设置');
console.log('OPENAI_BASE_URL:', process.env.OPENAI_BASE_URL || '未设置');
console.log('ZHIPU_API_KEY:', process.env.ZHIPU_API_KEY ? '已设置' : '未设置');
console.log('ZHIPU_BASE_URL:', process.env.ZHIPU_BASE_URL || '未设置');
console.log('');

if (process.env.OPENAI_BASE_URL?.includes('bigmodel.cn')) {
  console.log('✅ 应该检测到智谱AI');
} else if (process.env.OPENAI_BASE_URL?.includes('deepseek.com')) {
  console.log('❌ 错误地检测为DeepSeek');
} else {
  console.log('⚠️ 未识别的提供商');
}

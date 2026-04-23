import { test, expect } from '@playwright/test';

test.describe('密码登录功能测试', () => {
  test('应该能够使用密码登录', async ({ page }) => {
    // 访问登录页面
    await page.goto('/login');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 点击"密码登录"选项卡
    await page.click('button:has-text("密码登录")');
    
    // 等待表单显示
    await page.waitForSelector('input[id="password-email"]');
    
    // 填写邮箱
    await page.fill('input[id="password-email"]', 'test@skillhub.com');
    
    // 填写密码
    await page.fill('input[id="password"]', 'Test123456');
    
    // 点击登录按钮
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);
    
    // 检查是否成功登录（重定向到仪表板或其他页面）
    const currentUrl = page.url();
    console.log('登录后URL:', currentUrl);
    
    // 验证登录成功 - 检查是否在仪表板页面或主页
    expect(currentUrl).toMatch(/\/(dashboard|skills|)$/);
    
    // 检查会话状态
    const sessionResponse = await page.request.get('/api/auth/session');
    const session = await sessionResponse.json();
    
    console.log('会话信息:', session);
    expect(session.user).toBeDefined();
    expect(session.user.email).toBe('test@skillhub.com');
  });

  test('应该显示错误信息当密码错误时', async ({ page }) => {
    // 访问登录页面
    await page.goto('/login');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 点击"密码登录"选项卡
    await page.click('button:has-text("密码登录")');
    
    // 等待表单显示
    await page.waitForSelector('input[id="password-email"]');
    
    // 填写邮箱
    await page.fill('input[id="password-email"]', 'test@skillhub.com');
    
    // 填写错误密码
    await page.fill('input[id="password"]', 'WrongPassword123');
    
    // 点击登录按钮
    await page.click('button[type="submit"]');
    
    // 等待错误信息显示
    await page.waitForSelector('.text-red-600');
    
    // 检查错误信息
    const errorElement = await page.$('.text-red-600');
    const errorMessage = await errorElement?.textContent();
    
    console.log('错误信息:', errorMessage);
    expect(errorMessage).toContain('邮箱或密码错误');
  });

  test('应该验证必填字段', async ({ page }) => {
    // 访问登录页面
    await page.goto('/login');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 点击"密码登录"选项卡
    await page.click('button:has-text("密码登录")');
    
    // 等待表单显示
    await page.waitForSelector('input[id="password-email"]');
    
    // 不填写任何字段，直接点击登录
    await page.click('button[type="submit"]');
    
    // 浏览器应该会阻止提交并显示验证错误
    // 或者显示我们的自定义错误信息
    await page.waitForTimeout(1000);
    
    // 检查是否有错误信息显示
    const errorElement = await page.$('.text-red-600');
    if (errorElement) {
      const errorMessage = await errorElement.textContent();
      console.log('验证错误信息:', errorMessage);
    }
  });
});
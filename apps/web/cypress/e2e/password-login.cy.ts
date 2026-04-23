/// <reference types="cypress" />
// Cypress 全局变量 (cy, describe, it, expect) 由 Cypress 运行时提供
// TypeScript 错误可以忽略，因为 cypress/tsconfig.json 已正确配置类型

describe('密码登录功能测试', () => {
  beforeEach(() => {
    // 访问登录页面
    cy.visit('/login');
    
    // 等待页面加载
    cy.get('h2').should('contain', '欢迎使用 Skill Hub');
  });

  it('应该能够切换到密码登录选项卡', () => {
    // 点击"密码登录"选项卡
    cy.contains('button', '密码登录').click();
    
    // 验证密码登录表单显示
    cy.get('input[id="password-email"]').should('be.visible');
    cy.get('input[id="password"]').should('be.visible');
  });

  it('应该能够使用密码登录', () => {
    // 点击"密码登录"选项卡
    cy.contains('button', '密码登录').click();
    
    // 填写邮箱
    cy.get('input[id="password-email"]').clear().type('test@skillhub.com');
    
    // 填写密码
    cy.get('input[id="password"]').clear().type('Test123456');
    
    // 点击登录按钮
    cy.get('button[type="submit"]').click();
    
    // 等待重定向（登录成功后会重定向到 dashboard 或 admin）
    cy.url({ timeout: 10000 }).should((url) => {
      // 应该重定向到仪表板、admin页面或skills页面
      expect(url).to.match(/\/(dashboard|admin|skills)/);
    });
    
    // 验证会话状态
    cy.request('/api/auth/session').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.user).to.exist;
      expect(response.body.user.email).to.eq('test@skillhub.com');
    });
  });

  it('应该显示错误信息当密码错误时', () => {
    // 点击"密码登录"选项卡
    cy.contains('button', '密码登录').click();
    
    // 填写邮箱
    cy.get('input[id="password-email"]').clear().type('test@skillhub.com');
    
    // 填写错误密码
    cy.get('input[id="password"]').clear().type('WrongPassword123');
    
    // 点击登录按钮
    cy.get('button[type="submit"]').click();
    
    // 等待错误信息显示
    cy.get('.text-red-600', { timeout: 10000 }).should('be.visible');
    
    // 检查错误信息内容
    cy.get('.text-red-600').should('contain', '邮箱或密码错误');
  });

  it('应该验证必填字段 - 空邮箱', () => {
    // 点击"密码登录"选项卡
    cy.contains('button', '密码登录').click();
    
    // 只填写密码，不填写邮箱
    cy.get('input[id="password"]').clear().type('Test123456');
    
    // 点击登录按钮
    cy.get('button[type="submit"]').click();
    
    // 浏览器应该会阻止提交或显示错误
    cy.wait(1000);
    
    // 检查是否有错误信息
    cy.get('.text-red-600').should('exist');
  });

  it('应该验证必填字段 - 空密码', () => {
    // 点击"密码登录"选项卡
    cy.contains('button', '密码登录').click();
    
    // 只填写邮箱，不填写密码
    cy.get('input[id="password-email"]').clear().type('test@skillhub.com');
    
    // 点击登录按钮
    cy.get('button[type="submit"]').click();
    
    // 等待错误信息显示
    cy.get('.text-red-600', { timeout: 10000 }).should('be.visible');
    
    // 检查错误信息
    cy.get('.text-red-600').should('contain', '请输入密码');
  });

  it('应该验证邮箱格式', () => {
    // 点击"密码登录"选项卡
    cy.contains('button', '密码登录').click();
    
    // 填写无效的邮箱格式
    cy.get('input[id="password-email"]').clear().type('invalid-email');
    cy.get('input[id="password"]').clear().type('Test123456');
    
    // 点击登录按钮
    cy.get('button[type="submit"]').click();
    
    // 等待错误信息显示
    cy.get('.text-red-600', { timeout: 10000 }).should('be.visible');
    
    // 检查错误信息
    cy.get('.text-red-600').should('contain', '请输入有效的邮箱地址');
  });

  it('应该在登录过程中显示加载状态', () => {
    // 点击"密码登录"选项卡
    cy.contains('button', '密码登录').click();
    
    // 填写正确的凭据
    cy.get('input[id="password-email"]').clear().type('test@skillhub.com');
    cy.get('input[id="password"]').clear().type('Test123456');
    
    // 点击登录按钮
    cy.get('button[type="submit"]').click();
    
    // 验证按钮显示加载状态（由于登录很快，可能看不到加载状态）
    // 这里只验证按钮被禁用或文本变化
    cy.get('button[type="submit"]').should(($btn) => {
      // 按钮可能被禁用或文本变为"登录中..."
      const isDisabled = $btn.is(':disabled');
      const hasLoadingText = $btn.text().includes('登录中');
      expect(isDisabled || hasLoadingText).to.be.true;
    });
  });

  it('Admin用户登录后应该跳转到admin页面', () => {
    // 点击"密码登录"选项卡
    cy.contains('button', '密码登录').click();
    
    // 填写admin邮箱（根据 .env.local 中的 ADMIN_EMAILS 配置）
    cy.get('input[id="password-email"]').clear().type('1055603323@qq.com');
    
    // 填写密码
    cy.get('input[id="password"]').clear().type('Admin@123456');
    
    // 点击登录按钮
    cy.get('button[type="submit"]').click();
    
    // 等待重定向到 admin 页面
    cy.url({ timeout: 10000 }).should('include', '/admin');
    
    // 验证会话状态
    cy.request('/api/auth/session').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.user).to.exist;
      expect(response.body.user.email).to.eq('1055603323@qq.com');
    });
  });
});
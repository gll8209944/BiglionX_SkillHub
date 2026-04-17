/// <reference types="cypress" />

describe('用户认证流程', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('应该成功访问首页', () => {
    cy.url().should('eq', 'http://localhost:3000/');
    cy.get('h1').should('be.visible');
  });

  it('应该显示导航栏', () => {
    cy.get('nav').should('be.visible');
    cy.contains('Skills').should('be.visible');
    cy.contains('Namespaces').should('be.visible');
  });

  it('应该能够导航到登录页面', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
    cy.get('h2').contains('登录').should('be.visible');
  });

  it('应该能够导航到注册页面', () => {
    cy.contains('Register').click();
    cy.url().should('include', '/register');
    cy.get('h2').contains('注册').should('be.visible');
  });
});

describe('登录功能', () => {
  it('应该显示登录表单', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('应该验证空表单提交', () => {
    cy.visit('/login');
    
    cy.get('button[type="submit"]').click();
    
    // 检查是否显示验证错误
    cy.get('input[name="email"]:invalid').should('exist');
  });

  it('应该使用无效凭据显示错误', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // 应该显示错误消息（根据实际实现调整）
    cy.contains('Invalid credentials').should('be.visible');
  });
});

describe('技能浏览功能', () => {
  it('应该能够访问技能列表页面', () => {
    cy.visit('/skills');
    
    cy.url().should('include', '/skills');
    cy.get('h1').contains('Skills').should('be.visible');
  });

  it('应该显示技能卡片', () => {
    cy.visit('/skills');
    
    // 等待技能加载
    cy.get('[data-testid="skill-card"]').should('exist');
  });

  it('应该能够搜索技能', () => {
    cy.visit('/skills');
    
    cy.get('input[placeholder*="Search"]').type('test');
    cy.get('button').contains('Search').click();
    
    // 验证URL包含搜索参数
    cy.url().should('include', 'search=test');
  });

  it('应该能够按类别过滤', () => {
    cy.visit('/skills');
    
    cy.get('select[name="category"]').select('ai-agent');
    
    // 验证URL包含过滤参数
    cy.url().should('include', 'category=ai-agent');
  });
});

describe('命名空间功能', () => {
  it('应该能够访问命名空间列表页面', () => {
    cy.visit('/namespaces');
    
    cy.url().should('include', '/namespaces');
    cy.get('h1').contains('Namespaces').should('be.visible');
  });

  it('应该显示命名空间卡片', () => {
    cy.visit('/namespaces');
    
    cy.get('[data-testid="namespace-card"]').should('exist');
  });
});

describe('响应式设计', () => {
  it('应该在移动设备上正常显示', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    
    cy.get('nav').should('be.visible');
    cy.get('button[aria-label="Menu"]').should('be.visible');
  });

  it('应该在平板设备上正常显示', () => {
    cy.viewport('ipad-2');
    cy.visit('/');
    
    cy.get('nav').should('be.visible');
  });

  it('应该在桌面设备上正常显示', () => {
    cy.viewport(1280, 720);
    cy.visit('/');
    
    cy.get('nav').should('be.visible');
  });
});

describe('错误处理', () => {
  it('应该显示404页面对于不存在的路线', () => {
    cy.visit('/nonexistent-page', { failOnStatusCode: false });
    
    cy.contains('404').should('be.visible');
    cy.contains('Not Found').should('be.visible');
  });

  it('应该处理网络错误', () => {
    cy.intercept('GET', '/api/skills*', {
      statusCode: 500,
      body: { error: 'Server error' },
    });
    
    cy.visit('/skills');
    
    cy.contains('Error').should('be.visible');
  });
});

describe('性能测试', () => {
  it('应该在合理时间内加载首页', () => {
    cy.visit('/', { timeout: 10000 });
    
    cy.get('h1').should('be.visible');
  });

  it('应该快速加载技能列表', () => {
    cy.visit('/skills', { timeout: 10000 });
    
    cy.get('[data-testid="skill-card"]').should('exist');
  });
});
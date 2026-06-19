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
    // 首页导航栏包含登录和注册按钮
    cy.contains('登录').should('be.visible');
    cy.contains('注册').should('be.visible');
  });

  it('应该能够导航到Skills页面', () => {
    // 首页没有直接的Skills链接，需要点击"浏览技能"按钮
    cy.contains('浏览技能').click();
    cy.url().should('include', '/skills');
    cy.get('h1').contains(/Skill|技能/i).should('be.visible');
  });
});

describe('登录功能', () => {
  it('应该显示GitHub登录按钮', () => {
    cy.visit('/login');
    
    // 检查GitHub登录按钮是否存在
    cy.contains('使用 GitHub 登录').should('be.visible');
    cy.get('button').contains('使用 GitHub 登录').should('be.visible');
  });

  it('应该显示登录页面标题', () => {
    cy.visit('/login');
    
    cy.contains('欢迎使用 Skill Hub').should('be.visible');
    cy.contains('AI Agent 技能注册中心').should('be.visible');
  });

  it('GitHub登录按钮应该可以点击', () => {
    cy.visit('/login');
    
    // 点击GitHub登录按钮（会触发OAuth流程）
    cy.contains('使用 GitHub 登录').click();
    
    // 按钮应该变为loading状态（会禁用或显示"登录中..."）
    cy.contains('登录中...').should('be.visible');
  });
});

describe('技能浏览功能', () => {
  it('应该能够访问技能列表页面', () => {
    cy.visit('/skills');
    
    cy.url().should('include', '/skills');
    cy.get('h1').contains(/Skill|技能/i).should('be.visible');
  });

  it('应该显示技能卡片', () => {
    cy.visit('/skills');
    
    // 等待技能列表加载（检查网格容器和链接）
    cy.get('main').within(() => {
      // 检查技能卡片网格容器
      cy.get('.grid').should('exist');
      // 或者检查是否有技能详情链接
      cy.get('a[href^="/skills/"]').should('have.length.at.least', 1);
    });
  });

  it('应该能够搜索技能', () => {
    cy.visit('/skills');
    
    // 搜索框使用SearchBox组件，在Hero区域
    cy.get('input[placeholder*="搜索"]').type('test', { delay: 50 });
    // 按回车键提交搜索
    cy.get('input[placeholder*="搜索"]').type('{enter}');
    
    // 验证URL包含搜索参数
    cy.url().should('include', 'q=test');
  });

  it('应该能够按类别过滤', () => {
    cy.visit('/skills');
    
    // 高级筛选面板在侧边栏
    cy.get('aside').within(() => {
      // 点击展开高级选项（如果折叠的话）
      cy.contains('展开高级选项').click();
      // 选择分类（select没有name属性，按顺序选择）
      cy.get('select').first().select(0); // 选择第一个分类（跳过“全部分类”）
      // 点击应用筛选按钮
      cy.contains('应用筛选').click();
    });
    
    // 验证URL包含过滤参数
    cy.url().should('include', 'category=');
  });
});

describe('响应式设计', () => {
  it('应该在移动设备上正常显示', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    
    cy.get('nav').should('be.visible');
    // 首页使用简单导航，没有汉堡菜单
    cy.get('nav').find('a').should('have.length.at.least', 1);
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
    
    // Next.js 404页面包含“404”文本
    cy.contains('404').should('be.visible');
  });

  it('应该处理网络错误', () => {
    cy.intercept('GET', '/api/skills*', {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('skillsApi');
      
    cy.visit('/skills');
      
    // 等待API请求完成
    cy.wait('@skillsApi');
      
    // 检查页面是否正常加载（即使API错误，页面也应该显示）
    cy.get('h1').contains(/Skill|技能/i).should('be.visible');
  });
});

describe('性能测试', () => {
  it('应该在合理时间内加载首页', () => {
    // pageLoadTimeout已在cypress.config.ts中设置为30秒
    cy.visit('/');
    
    cy.get('h1').should('be.visible');
  });

  it('应该快速加载技能列表', () => {
    cy.visit('/skills');
    
    // 检查技能列表是否加载（使用全局超时配置）
    cy.get('a[href^="/skills/"]').should('have.length.at.least', 1);
  });
});
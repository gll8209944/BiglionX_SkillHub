describe('完整用户流程', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'TestPassword123',
    name: 'Test User',
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('完整的用户注册到创建Skill流程', () => {
    // 1. 注册新用户
    cy.contains('Register').click();
    cy.url().should('include', '/register');
    
    cy.get('input[name="name"]').type(testUser.name);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // 等待重定向到仪表板
    cy.url().should('include', '/dashboard');
    
    // 2. 验证用户已登录
    cy.get('[data-testid="user-menu"]').should('be.visible');
    
    // 3. 导航到创建Skill页面
    cy.contains('Create Skill').click();
    cy.url().should('include', '/skills/new');
    
    // 4. 填写Skill表单
    cy.get('input[name="name"]').type('My Test Skill');
    cy.get('input[name="slug"]').type('my-test-skill');
    cy.get('textarea[name="description"]').type('This is a test skill for E2E testing');
    cy.get('select[name="category"]').select('ai-agent');
    
    // 添加标签
    cy.get('input[placeholder*="Add tags"]').type('testing{enter}');
    cy.get('input[placeholder*="Add tags"]').type('e2e{enter}');
    
    // 5. 提交表单
    cy.get('button[type="submit"]').click();
    
    // 6. 验证创建成功
    cy.url().should('include', '/skills/');
    cy.contains('My Test Skill').should('be.visible');
    
    // 7. 查看Skill详情
    cy.get('[data-testid="skill-card"]').first().click();
    cy.url().should('include', '/skills/my-test-skill');
    
    // 8. 验证Skill信息
    cy.contains('My Test Skill').should('be.visible');
    cy.contains('This is a test skill for E2E testing').should('be.visible');
    cy.contains('testing').should('be.visible');
    cy.contains('e2e').should('be.visible');
  });

  it('用户登录和登出流程', () => {
    // 1. 登录
    cy.login(testUser.email, testUser.password);
    
    // 2. 验证已登录
    cy.get('[data-testid="user-menu"]').should('be.visible');
    cy.contains(testUser.name).should('be.visible');
    
    // 3. 访问受保护的页面
    cy.visit('/dashboard');
    cy.url().should('include', '/dashboard');
    
    // 4. 登出
    cy.logout();
    
    // 5. 验证已登出
    cy.url().should('include', '/login');
    cy.get('[data-testid="user-menu"]').should('not.exist');
  });

  it('搜索和过滤Skills', () => {
    // 1. 访问Skills页面
    cy.visit('/skills');
    
    // 2. 搜索特定技能
    cy.get('input[placeholder*="Search"]').type('AI');
    cy.get('button').contains('Search').click();
    
    // 3. 验证搜索结果
    cy.url().should('include', 'search=AI');
    cy.get('[data-testid="skill-card"]').each(($card) => {
      cy.wrap($card).contains(/AI|ai/i).should('exist');
    });
    
    // 4. 按类别过滤
    cy.get('select[name="category"]').select('development');
    cy.url().should('include', 'category=development');
    
    // 5. 清除过滤器
    cy.get('button').contains('Clear').click();
    cy.url().should('not.include', 'search=');
    cy.url().should('not.include', 'category=');
  });

  it('创建和管理Namespace', () => {
    // 1. 登录
    cy.login(testUser.email, testUser.password);
    
    // 2. 创建Namespace
    cy.visit('/namespaces/new');
    cy.get('input[name="name"]').type('My Team');
    cy.get('input[name="slug"]').type('my-team');
    cy.get('textarea[name="description"]').type('A team workspace for collaboration');
    cy.get('select[name="type"]').select('TEAM');
    cy.get('button[type="submit"]').click();
    
    // 3. 验证创建成功
    cy.url().should('include', '/namespaces/my-team');
    cy.contains('My Team').should('be.visible');
    
    // 4. 在Namespace中创建Skill
    cy.contains('Create Skill').click();
    cy.get('input[name="name"]').type('Team Skill');
    cy.get('input[name="slug"]').type('team-skill');
    cy.get('button[type="submit"]').click();
    
    // 5. 验证Skill在Namespace中
    cy.url().should('include', '/skills/team-skill');
    cy.contains('My Team').should('be.visible');
  });

  it('分页和导航', () => {
    cy.visit('/skills');
    
    // 1. 验证初始加载
    cy.get('[data-testid="skill-card"]').should('exist');
    
    // 2. 滚动到底部触发加载更多（如果有无限滚动）
    // 或者点击下一页按钮
    cy.get('button').contains('Next').click({ force: true });
    
    // 3. 验证URL包含页码
    cy.url().should('include', 'page=2');
    
    // 4. 返回第一页
    cy.get('button').contains('Previous').click({ force: true });
    cy.url().should('include', 'page=1');
  });

  it('表单验证和错误处理', () => {
    cy.visit('/skills/new');
    
    // 1. 尝试提交空表单
    cy.get('button[type="submit"]').click();
    
    // 2. 验证错误消息
    cy.get('input[name="name"]:invalid').should('exist');
    cy.get('input[name="slug"]:invalid').should('exist');
    
    // 3. 输入无效数据
    cy.get('input[name="slug"]').type('INVALID SLUG!');
    cy.get('button[type="submit"]').click();
    
    // 4. 验证格式错误
    cy.contains('Invalid slug format').should('be.visible');
    
    // 5. 修正并成功提交
    cy.get('input[name="name"]').type('Valid Skill');
    cy.get('input[name="slug"]').clear().type('valid-skill');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/skills/valid-skill');
  });

  it('响应式布局测试', () => {
    // 移动设备
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.get('nav').should('be.visible');
    cy.get('button[aria-label="Menu"]').should('be.visible').click();
    cy.get('[data-testid="mobile-menu"]').should('be.visible');
    
    // 平板设备
    cy.viewport('ipad-2');
    cy.visit('/skills');
    cy.get('[data-testid="skill-card"]').should('have.length.greaterThan', 0);
    
    // 桌面设备
    cy.viewport(1920, 1080);
    cy.visit('/');
    cy.get('nav').should('be.visible');
    cy.get('button[aria-label="Menu"]').should('not.be.visible');
  });
});

describe('管理员功能', () => {
  const adminUser = {
    email: 'admin@example.com',
    password: 'AdminPassword123',
  };

  it('审核Pending Skills', () => {
    // 1. 以管理员身份登录
    cy.login(adminUser.email, adminUser.password);
    
    // 2. 访问审核页面
    cy.visit('/admin/reviews');
    cy.url().should('include', '/admin/reviews');
    
    // 3. 查看待审核列表
    cy.get('[data-testid="review-item"]').should('exist');
    
    // 4. 审核一个Skill
    cy.get('[data-testid="review-item"]').first().within(() => {
      cy.contains('Approve').click();
    });
    
    // 5. 确认审核
    cy.get('[data-testid="confirm-dialog"]').should('be.visible');
    cy.get('button').contains('Confirm').click();
    
    // 6. 验证审核成功
    cy.contains('Approved successfully').should('be.visible');
  });

  it('查看分析数据', () => {
    cy.login(adminUser.email, adminUser.password);
    
    // 访问分析仪表板
    cy.visit('/admin/analytics');
    cy.url().should('include', '/admin/analytics');
    
    // 验证数据显示
    cy.contains('Total Skills').should('be.visible');
    cy.contains('Total Downloads').should('be.visible');
    cy.contains('Active Users').should('be.visible');
    
    // 验证图表存在
    cy.get('[data-testid="chart"]').should('exist');
    
    // 切换时间周期
    cy.get('button').contains('7d').click();
    cy.get('button').contains('30d').click();
    cy.get('button').contains('90d').click();
  });
});
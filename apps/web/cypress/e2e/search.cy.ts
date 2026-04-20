/// <reference types="cypress" />

describe('搜索功能 E2E 测试', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('全局搜索', () => {
    it('应该能够通过导航栏搜索技能', () => {
      // 在导航栏中找到搜索框
      cy.get('input[placeholder*="Search"]').should('be.visible');
      
      // 输入搜索词
      cy.get('input[placeholder*="Search"]').type('ai agent');
      
      // 按回车或点击搜索按钮
      cy.get('input[placeholder*="Search"]').type('{enter}');
      
      // 验证跳转到搜索结果页面
      cy.url().should('include', '/search');
      cy.url().should('include', 'q=ai+agent');
    });

    it('应该显示搜索建议', () => {
      cy.get('input[placeholder*="Search"]').type('ai');
      
      // 等待建议出现（防抖延迟）
      cy.wait(300);
      
      // 验证建议下拉框出现
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      
      // 验证建议项存在
      cy.get('[data-testid="suggestion-item"]').should('have.length.greaterThan', 0);
    });

    it('应该能够点击搜索建议', () => {
      cy.get('input[placeholder*="Search"]').type('python');
      cy.wait(300);
      
      // 点击第一个建议
      cy.get('[data-testid="suggestion-item"]').first().click();
      
      // 验证跳转到搜索结果
      cy.url().should('include', '/search');
    });

    it('应该显示热门搜索词', () => {
      cy.get('input[placeholder*="Search"]').focus();
      
      // 验证热门搜索区域显示
      cy.get('[data-testid="popular-searches"]').should('be.visible');
      
      // 验证有热门词列表
      cy.get('[data-testid="popular-search-item"]').should('have.length.greaterThan', 0);
    });

    it('应该能够点击热门搜索词', () => {
      cy.get('input[placeholder*="Search"]').focus();
      
      // 点击第一个热门词
      cy.get('[data-testid="popular-search-item"]').first().click();
      
      // 验证执行搜索
      cy.url().should('include', '/search');
    });
  });

  describe('高级搜索过滤', () => {
    it('应该能够按分类过滤', () => {
      cy.visit('/skills');
      
      // 选择分类
      cy.get('select[name="category"]').select('ai-agent');
      
      // 验证URL包含分类参数
      cy.url().should('include', 'category=ai-agent');
      
      // 验证结果更新
      cy.get('[data-testid="skill-card"]').should('exist');
    });

    it('应该能够按语言过滤', () => {
      cy.visit('/skills');
      
      // 选择语言
      cy.get('select[name="language"]').select('python');
      
      // 验证URL包含语言参数
      cy.url().should('include', 'language=python');
    });

    it('应该能够组合多个过滤条件', () => {
      cy.visit('/skills');
      
      // 设置多个过滤条件
      cy.get('input[placeholder*="Search"]').type('agent');
      cy.get('select[name="category"]').select('ai-agent');
      cy.get('select[name="language"]').select('python');
      
      // 验证URL包含所有参数
      cy.url().should('include', 'search=agent');
      cy.url().should('include', 'category=ai-agent');
      cy.url().should('include', 'language=python');
    });

    it('应该能够清除过滤器', () => {
      cy.visit('/skills?search=test&category=ai&language=python');
      
      // 点击清除按钮
      cy.get('button').contains(/Clear|清除/).click();
      
      // 验证URL不再包含过滤参数
      cy.url().should('not.include', 'search=');
      cy.url().should('not.include', 'category=');
      cy.url().should('not.include', 'language=');
    });
  });

  describe('排序功能', () => {
    it('应该能够按相关性排序', () => {
      cy.visit('/skills?search=test');
      
      cy.get('select[name="sortBy"]').select('relevance');
      
      cy.url().should('include', 'sortBy=relevance');
    });

    it('应该能够按质量评分排序', () => {
      cy.visit('/skills');
      
      cy.get('select[name="sortBy"]').select('quality');
      
      cy.url().should('include', 'sortBy=quality');
    });

    it('应该能够按Stars排序', () => {
      cy.visit('/skills');
      
      cy.get('select[name="sortBy"]').select('stars');
      
      cy.url().should('include', 'sortBy=stars');
    });

    it('应该能够按下载量排序', () => {
      cy.visit('/skills');
      
      cy.get('select[name="sortBy"]').select('downloads');
      
      cy.url().should('include', 'sortBy=downloads');
    });

    it('应该能够按更新时间排序', () => {
      cy.visit('/skills');
      
      cy.get('select[name="sortBy"]').select('updated');
      
      cy.url().should('include', 'sortBy=updated');
    });
  });

  describe('分页功能', () => {
    it('应该能够翻页', () => {
      cy.visit('/skills');
      
      // 点击下一页
      cy.get('button').contains(/Next|下一页/).click({ force: true });
      
      // 验证URL包含页码
      cy.url().should('include', 'page=2');
    });

    it('应该能够返回上一页', () => {
      cy.visit('/skills?page=2');
      
      // 点击上一页
      cy.get('button').contains(/Previous|上一页/).click({ force: true });
      
      // 验证回到第一页
      cy.url().should('include', 'page=1');
    });

    it('应该能够直接跳转到指定页', () => {
      cy.visit('/skills');
      
      // 如果有页码输入框
      cy.get('input[type="number"][placeholder*="Page"]').then($input => {
        if ($input.length > 0) {
          cy.wrap($input).clear().type('3{enter}');
          cy.url().should('include', 'page=3');
        }
      });
    });
  });

  describe('搜索结果展示', () => {
    it('应该显示搜索结果数量', () => {
      cy.visit('/skills?search=test');
      
      // 验证显示结果总数
      cy.contains(/Found \d+ skills|找到 \d+ 个技能/i).should('be.visible');
    });

    it('应该显示技能卡片信息', () => {
      cy.visit('/skills');
      
      cy.get('[data-testid="skill-card"]').first().within(() => {
        // 验证卡片包含必要信息
        cy.get('h3').should('be.visible'); // 技能名称
        cy.get('p').should('be.visible'); // 描述
        cy.get('[data-testid="skill-tags"]').should('exist'); // 标签
      });
    });

    it('空搜索结果应该显示友好提示', () => {
      cy.visit('/skills?search=xyznonexistent123');
      
      // 验证显示无结果提示
      cy.contains(/No results found|未找到结果/i).should('be.visible');
      
      // 可能提供建议
      cy.contains(/Try different keywords|尝试其他关键词/i).should('be.visible');
    });
  });

  describe('搜索历史记录', () => {
    it('应该保存搜索历史', () => {
      cy.visit('/skills');
      
      // 执行搜索
      cy.get('input[placeholder*="Search"]').type('test search{enter}');
      cy.url().should('include', 'search=test+search');
      
      // 返回首页再次搜索
      cy.visit('/');
      cy.get('input[placeholder*="Search"]').type('another search{enter}');
      
      // 验证历史记录存在（如果实现了此功能）
      cy.get('input[placeholder*="Search"]').focus();
      cy.get('[data-testid="search-history"]').then($history => {
        if ($history.length > 0) {
          cy.wrap($history).should('be.visible');
        }
      });
    });

    it('应该能够清除搜索历史', () => {
      cy.visit('/');
      
      // 如果有清除历史按钮
      cy.get('button[data-testid="clear-history"]').then($btn => {
        if ($btn.length > 0) {
          cy.wrap($btn).click();
          cy.get('[data-testid="search-history"]').should('not.exist');
        }
      });
    });
  });

  describe('性能测试', () => {
    it('搜索建议应该快速响应', () => {
      const startTime = Date.now();
      
      cy.get('input[placeholder*="Search"]').type('test');
      cy.wait(300);
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
      
      const endTime = Date.now();
      cy.log(`搜索建议响应时间: ${endTime - startTime}ms`);
      
      // 应该在合理时间内响应（考虑网络延迟）
      expect(endTime - startTime).to.be.lessThan(2000);
    });

    it('搜索结果应该在合理时间内加载', () => {
      cy.visit('/skills?search=test', { timeout: 10000 });
      
      cy.get('[data-testid="skill-card"]').should('exist');
    });
  });

  describe('移动端搜索', () => {
    it('应该在移动设备上正常显示搜索功能', () => {
      cy.viewport('iphone-6');
      cy.visit('/');
      
      // 可能需要先打开菜单
      cy.get('button[aria-label="Menu"]').click();
      
      // 验证搜索框可见
      cy.get('input[placeholder*="Search"]').should('be.visible');
    });

    it('移动端搜索建议应该正确显示', () => {
      cy.viewport('iphone-6');
      cy.visit('/');
      
      cy.get('input[placeholder*="Search"]').type('ai');
      cy.wait(300);
      
      cy.get('[data-testid="search-suggestions"]').should('be.visible');
    });
  });

  describe('错误处理', () => {
    it('应该处理搜索API错误', () => {
      // Mock API 错误
      cy.intercept('GET', '/api/search*', {
        statusCode: 500,
        body: { error: 'Search failed' },
      });
      
      cy.visit('/skills');
      cy.get('input[placeholder*="Search"]').type('test{enter}');
      
      // 应该显示错误消息
      cy.contains(/Error|错误/i).should('be.visible');
    });

    it('应该处理网络超时', () => {
      cy.intercept('GET', '/api/search*', {
        delay: 10000,
      });
      
      cy.visit('/skills');
      cy.get('input[placeholder*="Search"]').type('test{enter}');
      
      // 应该显示加载状态或超时提示
      cy.contains(/Loading|加载中/i).should('be.visible');
    });
  });
});

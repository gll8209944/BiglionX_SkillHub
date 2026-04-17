# SkillHub 测试文档

本文档介绍了SkillHub项目的测试策略、测试设置和如何运行测试。

## 目录

- [测试类型](#测试类型)
- [测试结构](#测试结构)
- [运行测试](#运行测试)
- [编写测试](#编写测试)
- [CI/CD 集成](#cicd-集成)
- [最佳实践](#最佳实践)

## 测试类型

### 1. 单元测试 (Unit Tests)

使用 **Jest** 和 **React Testing Library** 进行单元测试。

**测试范围:**
- UI组件 (LoadingSpinner, Alert, ErrorBoundary, PageLoader)
- 工具函数 (表单验证、API客户端等)
- Hooks
- 独立的服务层逻辑

**位置:** `apps/web/components/ui/__tests__/` 和 `apps/web/lib/__tests__/`

### 2. 集成测试 (Integration Tests)

测试API路由和数据库交互。

**测试范围:**
- API端点 (Skills, Namespaces, Reviews, Analytics)
- 数据库操作
- 认证和授权
- 请求/响应处理

**位置:** `apps/web/app/api/__tests__/`

### 3. 端到端测试 (E2E Tests)

使用 **Cypress** 进行完整的用户流程测试。

**测试范围:**
- 用户注册/登录流程
- 创建和管理Skills
- 搜索和过滤功能
- 响应式设计
- 错误处理
- 管理员功能

**位置:** `apps/web/cypress/e2e/`

## 测试结构

```
apps/web/
├── components/
│   └── ui/
│       ├── __tests__/           # UI组件测试
│       │   ├── LoadingSpinner.test.tsx
│       │   ├── Alert.test.tsx
│       │   ├── ErrorBoundary.test.tsx
│       │   └── PageLoader.test.tsx
├── app/
│   └── api/
│       └── __tests__/           # API集成测试
│           ├── mocks.ts
│           ├── skills.test.ts
│           ├── namespaces.test.ts
│           ├── reviews.test.ts
│           └── analytics.test.ts
├── lib/
│   └── __tests__/               # 工具函数测试
│       └── form-validation.test.ts
├── cypress/
│   ├── e2e/                     # E2E测试
│   │   ├── app.cy.ts
│   │   └── user-flow.cy.ts
│   ├── fixtures/                # 测试数据
│   └── support/                 # Cypress支持文件
│       ├── commands.ts          # 自定义命令
│       └── e2e.ts               # E2E配置
├── jest.config.ts               # Jest配置
├── jest.setup.ts                # Jest设置
└── cypress.config.ts            # Cypress配置
```

## 运行测试

### 安装依赖

```bash
cd apps/web
npm install
```

### 单元测试和集成测试

```bash
# 运行所有测试
npm test

# 监视模式（开发时使用）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### E2E测试

```bash
# 打开Cypress交互式测试运行器
npm run cypress:open

# 在命令行运行所有E2E测试
npm run cypress:run

# 启动开发服务器并运行E2E测试
npm run test:e2e
```

### CI/CD中运行

测试会自动在GitHub Actions中运行：
- 推送到 `main` 或 `develop` 分支时
- 创建Pull Request时

## 编写测试

### UI组件测试示例

```tsx
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner 组件', () => {
  it('应该渲染默认的加载旋转器', () => {
    render(<LoadingSpinner />);
    
    const spinner = document.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });
});
```

### API集成测试示例

```typescript
import { NextRequest } from 'next/server';
import { GET } from '../skills/route';
import { mockPrisma } from './mocks';

describe('Skills API', () => {
  it('应该返回技能列表', async () => {
    mockPrisma.skill.findMany.mockResolvedValue([...]);
    
    const request = new NextRequest('http://localhost:3000/api/skills');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
  });
});
```

### E2E测试示例

```typescript
describe('登录功能', () => {
  it('应该成功登录', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

## CI/CD 集成

### GitHub Actions工作流

项目包含两个CI/CD工作流：

1. **tests.yml** - 快速测试工作流
   - 运行单元测试
   - 运行E2E测试
   - 在 `develop` 分支触发

2. **ci-cd.yml** - 完整CI/CD管道
   - 单元测试和覆盖率
   - E2E测试
   - 构建验证
   - 安全扫描
   - 代码质量检查
   - 部署准备
   - 在 `main` 分支和PR触发

### 环境变量

在CI环境中需要设置以下环境变量：

```yaml
env:
  DATABASE_URL: postgresql://user:pass@localhost:5432/test
  REDIS_URL: redis://localhost:6379
  NEXTAUTH_SECRET: your-secret-key
  NEXTAUTH_URL: http://localhost:3000
```

## 最佳实践

### 1. 测试命名

- 使用描述性的测试名称
- 遵循 "应该..." 的格式
- 包含测试的场景和预期结果

```typescript
it('应该在无效凭据时显示错误消息', () => {
  // ...
});
```

### 2. AAA模式

遵循 Arrange-Act-Assert 模式：

```typescript
it('应该创建新技能', () => {
  // Arrange - 准备
  const skillData = { name: 'Test', slug: 'test' };
  
  // Act - 执行
  const result = await createSkill(skillData);
  
  // Assert - 断言
  expect(result.name).toBe('Test');
});
```

### 3. Mock外部依赖

- Mock数据库调用
- Mock外部API
- Mock认证服务

```typescript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    skill: {
      findMany: jest.fn(),
    },
  },
}));
```

### 4. 测试数据隔离

- 每个测试使用独立的数据
- 在 `beforeEach` 中清理mock
- 避免测试之间的依赖

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 5. E2E测试最佳实践

- 使用 `data-testid` 属性选择元素
- 避免硬编码等待时间
- 使用自定义命令减少重复
- 测试关键用户流程

```typescript
// 好的做法
cy.get('[data-testid="submit-button"]').click();

// 避免
cy.get('.btn.btn-primary').click();
```

### 6. 覆盖率目标

- **语句覆盖率**: > 80%
- **分支覆盖率**: > 75%
- **函数覆盖率**: > 80%
- **行覆盖率**: > 80%

## 调试测试

### Jest调试

```bash
# 运行单个测试文件
npm test -- LoadingSpinner.test.tsx

# 运行匹配的测试
npm test -- -t "应该渲染默认"

# 调试模式
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Cypress调试

```bash
# 打开Cypress UI
npm run cypress:open

# 在测试中添加断点
cy.pause();

# 截图
cy.screenshot();
```

## 常见问题

### Q: 测试失败说找不到模块？

A: 确保已安装所有依赖：
```bash
npm install
```

### Q: E2E测试超时？

A: 增加超时时间或检查服务器是否正确启动：
```typescript
cy.visit('/', { timeout: 10000 });
```

### Q: Mock不工作？

A: 确保在导入之前设置mock：
```typescript
jest.mock('@/lib/prisma', () => ({...}));
import { GET } from '../route';
```

## 资源

- [Jest文档](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Cypress文档](https://docs.cypress.io/)
- [Next.js测试指南](https://nextjs.org/docs/testing)

## 贡献

欢迎贡献测试！请遵循以下步骤：

1. 为新功能编写测试
2. 确保所有测试通过
3. 保持测试覆盖率
4. 提交PR时包含测试结果

---

最后更新: 2026-04-17
# 快速测试指南

## 🚀 快速开始

### 1. 安装依赖

```bash
cd apps/web
npm install
```

### 2. 运行测试

#### 单元测试和集成测试

```bash
# 运行所有测试
npm test

# 监视模式（开发时推荐）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

#### E2E测试

```bash
# 打开Cypress UI（推荐用于开发）
npm run cypress:open

# 命令行运行所有E2E测试
npm run cypress:run

# 启动服务器并运行E2E测试
npm run test:e2e
```

---

## 📁 测试文件位置

```
apps/web/
├── components/ui/__tests__/        # UI组件测试
│   ├── LoadingSpinner.test.tsx
│   ├── Alert.test.tsx
│   ├── ErrorBoundary.test.tsx
│   └── PageLoader.test.tsx
├── app/api/__tests__/              # API集成测试
│   ├── mocks.ts
│   ├── skills.test.ts
│   ├── namespaces.test.ts
│   ├── reviews.test.ts
│   └── analytics.test.ts
├── lib/__tests__/                  # 工具函数测试
│   └── form-validation.test.ts
└── cypress/e2e/                    # E2E测试
    ├── app.cy.ts
    └── user-flow.cy.ts
```

---

## 🧪 测试单个文件

### Jest测试

```bash
# 运行特定测试文件
npm test -- LoadingSpinner.test.tsx

# 运行匹配的测试
npm test -- -t "应该渲染默认"

# 运行API测试
npm test -- skills.test.ts
```

### Cypress测试

```bash
# 在Cypress UI中选择特定测试
npm run cypress:open

# 命令行运行特定测试文件
npx cypress run --spec "cypress/e2e/app.cy.ts"
```

---

## 🔍 调试测试

### Jest调试

```bash
# 使用Node调试器
node --inspect-brk node_modules/.bin/jest --runInBand

# 在Chrome中打开 chrome://inspect
# 点击 "Open dedicated DevTools for Node"
```

### Cypress调试

```typescript
// 在测试中添加断点
it('应该工作', () => {
  cy.visit('/');
  cy.pause(); // 暂停执行
  // ...
});

// 截图调试
cy.screenshot();

// 日志输出
cy.log('当前状态:', someValue);
```

---

## ✅ 测试清单

运行测试前检查：

- [ ] 已安装所有依赖 (`npm install`)
- [ ] 环境变量已配置 (`.env.local`)
- [ ] 数据库正在运行（如需要）
- [ ] Redis正在运行（如需要）

---

## 🎯 测试最佳实践

### 1. 编写测试

```typescript
// ✅ 好的测试名称
it('应该在无效邮箱时显示错误', () => {
  // ...
});

// ❌ 避免模糊的名称
it('测试邮箱', () => {
  // ...
});
```

### 2. 使用AAA模式

```typescript
it('应该创建技能', () => {
  // Arrange - 准备
  const data = { name: 'Test', slug: 'test' };
  
  // Act - 执行
  const result = await createSkill(data);
  
  // Assert - 断言
  expect(result.name).toBe('Test');
});
```

### 3. Mock外部依赖

```typescript
// 在测试文件顶部
jest.mock('@/lib/prisma', () => ({
  prisma: {
    skill: {
      findMany: jest.fn(),
    },
  },
}));
```

---

## 🐛 常见问题

### Q: 测试说找不到模块？

```bash
# 重新安装依赖
rm -rf node_modules
npm install
```

### Q: Cypress无法连接服务器？

```bash
# 确保服务器在运行
npm run dev

# 或使用自动启动
npm run test:e2e
```

### Q: 测试超时？

```typescript
// 增加超时时间
it('应该加载', { timeout: 10000 }, () => {
  // ...
});
```

### Q: Mock不工作？

```typescript
// 确保在导入之前设置mock
jest.mock('@/lib/prisma', () => ({...}));
import { GET } from '../route'; // 在mock之后导入
```

---

## 📊 查看覆盖率

```bash
# 生成覆盖率报告
npm run test:coverage

# 在浏览器中查看
open coverage/lcov-report/index.html
```

---

## 🔄 CI/CD中的测试

测试会在以下情况自动运行：
- 推送到 `main` 或 `develop` 分支
- 创建Pull Request时

查看GitHub Actions状态：
https://github.com/your-org/skillhub/actions

---

## 📚 更多资源

- [完整测试指南](TESTING_GUIDE.md)
- [Jest文档](https://jestjs.io/)
- [Cypress文档](https://docs.cypress.io/)
- [Testing Library](https://testing-library.com/)

---

**提示**: 在开发新功能时，先写测试再写代码（TDD）可以获得更好的代码质量！
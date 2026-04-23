# Cypress E2E 测试

## 目录结构

```
cypress/
├── e2e/              # 端到端测试文件
│   ├── password-login.cy.ts    # 密码登录功能测试
│   └── ...
├── fixtures/         # 测试数据固定文件
├── support/          # 支持文件
│   ├── commands.ts   # 自定义命令
│   └── e2e.ts       # E2E 配置
└── tsconfig.json     # Cypress TypeScript 配置
```

## 运行测试

### 1. 启动开发服务器

```bash
cd apps/web
npm run dev
```

确保服务器运行在 `http://localhost:3000`

### 2. 运行 Cypress

#### 方式一：打开 Cypress UI（推荐用于开发）

```bash
npm run cypress:open
```

这会打开 Cypress 图形界面，您可以：
- 选择要运行的测试文件
- 实时查看测试执行过程
- 调试失败的测试

#### 方式二：命令行运行所有测试

```bash
npm run cypress:run
```

这会在无头模式下运行所有测试，适合 CI/CD。

## 测试文件说明

### password-login.cy.ts

测试密码登录功能的完整流程：

1. ✅ 切换到密码登录选项卡
2. ✅ 普通用户密码登录成功
3. ✅ 密码错误时显示错误信息
4. ✅ 空邮箱验证
5. ✅ 空密码验证
6. ✅ 邮箱格式验证
7. ✅ 登录加载状态
8. ✅ Admin 用户登录后跳转到 admin 页面

## 常见问题

### TypeScript 错误

如果您在 IDE 中看到类似 `'cy' is not defined` 或 `'describe' is not defined` 的错误，这是正常的。

**原因**：VSCode 可能使用了项目根目录的 `tsconfig.json`，而该文件排除了 `cypress` 目录。

**解决方案**：
1. 这些错误不影响测试运行
2. Cypress 有自己的 `cypress/tsconfig.json` 配置
3. 运行时 Cypress 会正确识别全局类型

如果想消除 IDE 错误，可以在 VSCode 中：
1. 打开任意 `.cy.ts` 文件
2. 点击右下角的 TypeScript 版本
3. 选择 "Select TypeScript Version" -> "Use Workspace Version"

### 测试失败

如果测试失败，检查：

1. **开发服务器是否运行**：确保 `npm run dev` 正在运行
2. **数据库连接**：确保数据库可访问
3. **测试用户是否存在**：某些测试需要特定的测试用户
4. **环境变量**：检查 `.env.local` 配置是否正确

### 超时问题

如果测试因超时而失败，可以调整 `cypress.config.ts` 中的超时设置：

```typescript
export default defineConfig({
  e2e: {
    defaultCommandTimeout: 10000,  // 增加超时时间
    pageLoadTimeout: 30000,
    // ...
  }
});
```

## 编写新测试

创建新的测试文件时，请遵循以下规范：

1. 文件命名：`*.cy.ts` 或 `*.cy.js`
2. 使用描述性的测试名称（中文或英文）
3. 每个测试应该独立，不依赖其他测试的状态
4. 使用 `beforeEach` 进行通用的初始化操作
5. 添加注释说明测试的目的和步骤

示例：

```typescript
describe('功能模块测试', () => {
  beforeEach(() => {
    cy.visit('/some-page');
  });

  it('应该能够执行某个操作', () => {
    // 测试步骤
    cy.get('#button').click();
    
    // 验证结果
    cy.get('.success-message').should('be.visible');
  });
});
```

## 最佳实践

1. **保持测试独立**：每个测试应该能够独立运行
2. **使用有意义的选择器**：优先使用 `data-testid` 属性
3. **等待异步操作**：使用 Cypress 的自动等待机制，避免硬编码 `cy.wait()`
4. **清理测试数据**：测试结束后清理创建的测试数据
5. **定期维护**：随着功能更新，及时更新相关测试

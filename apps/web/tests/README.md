# Playwright E2E 测试

## 目录结构

```
tests/
├── password-login.spec.ts    # 密码登录功能测试
├── tsconfig.json             # Playwright TypeScript 配置
└── README.md                 # 本文档
```

## 安装

Playwright 已经在 `package.json` 中配置。如果尚未安装浏览器，运行：

```bash
npx playwright install
```

这将安装 Chromium、Firefox 和 WebKit 浏览器用于测试。

## 运行测试

### 1. 启动开发服务器

在运行测试之前，确保开发服务器正在运行：

```bash
cd apps/web
npm run dev
```

服务器应该运行在 `http://localhost:3000`

### 2. 运行 Playwright 测试

#### 方式一：运行所有测试

```bash
npx playwright test
```

#### 方式二：运行特定测试文件

```bash
npx playwright test tests/password-login.spec.ts
```

#### 方式三：以 UI 模式运行（推荐用于调试）

```bash
npx playwright test --ui
```

这会打开 Playwright UI，您可以：
- 可视化地查看测试执行
- 逐步调试测试
- 查看截图和视频

#### 方式四：以 headed 模式运行（显示浏览器）

```bash
npx playwright test --headed
```

### 3. 查看测试报告

测试完成后，查看 HTML 报告：

```bash
npx playwright show-report
```

## 配置

### playwright.config.ts

主要配置项：

```typescript
export default defineConfig({
  testDir: './tests',           // 测试目录
  baseURL: 'http://localhost:3000',  // 基础 URL
  reporter: 'html',             // 报告格式
  projects: [                   // 浏览器配置
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
```

### tests/tsconfig.json

Playwright 测试的 TypeScript 配置：

```json
{
  "compilerOptions": {
    "types": ["@playwright/test"]  // 包含 Playwright 类型
  }
}
```

## 编写测试

### 基本结构

```typescript
import { test, expect } from '@playwright/test';

test.describe('功能模块测试', () => {
  test('应该能够执行某个操作', async ({ page }) => {
    // 1. 导航到页面
    await page.goto('/some-page');
    
    // 2. 执行操作
    await page.click('#button');
    
    // 3. 验证结果
    await expect(page.locator('.success')).toBeVisible();
  });
});
```

### 常用 API

#### 导航

```typescript
await page.goto('/login');
await page.waitForLoadState('networkidle');
```

#### 元素操作

```typescript
// 点击
await page.click('button[type="submit"]');

// 填写表单
await page.fill('input[email]', 'test@example.com');
await page.fill('input[password]', 'password123');

// 选择选项
await page.selectOption('select#role', 'admin');
```

#### 断言

```typescript
// 可见性
await expect(page.locator('.error')).toBeVisible();

// 文本内容
await expect(page.locator('h1')).toContainText('Welcome');

// URL
expect(page.url()).toContain('/dashboard');

// 元素数量
await expect(page.locator('.item')).toHaveCount(5);
```

#### 等待

```typescript
// 等待元素出现
await page.waitForSelector('.loaded');

// 等待导航
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/next-page"]')
]);

// 固定等待（尽量避免）
await page.waitForTimeout(1000);
```

## 测试示例

### password-login.spec.ts

测试密码登录功能：

1. ✅ 成功登录
2. ✅ 密码错误时显示错误信息
3. ✅ 必填字段验证

## 调试技巧

### 1. 使用 --debug 标志

```bash
npx playwright test --debug
```

这会打开浏览器开发者工具并暂停在每个步骤。

### 2. 截图

```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### 3. 追踪

在 `playwright.config.ts` 中启用：

```typescript
use: {
  trace: 'on-first-retry',
}
```

查看追踪：

```bash
npx playwright show-trace trace.zip
```

### 4. 控制台日志

```typescript
page.on('console', msg => console.log(msg.text()));
```

## 常见问题

### TypeScript 错误

如果在 IDE 中看到 `'page' implicitly has an 'any' type` 错误：

**原因**：VSCode 可能没有正确加载 `tests/tsconfig.json`

**解决方案**：
1. 重启 VSCode TypeScript 服务器
   - 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
   - 输入 "TypeScript: Restart TS Server"
   - 按 Enter

2. 或者在 VSCode 设置中配置：
   ```json
   {
     "typescript.tsdk": "node_modules/typescript/lib"
   }
   ```

3. 这些错误不影响测试运行，只是 IDE 的类型检查问题

### 超时错误

如果测试因超时而失败：

```typescript
// 增加超时时间
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60秒
  // ...
});
```

或在配置文件中：

```typescript
export default defineConfig({
  timeout: 60000,
});
```

### 元素未找到

确保：
1. 页面已完全加载
2. 选择器正确
3. 元素确实存在

使用 waitForSelector：

```typescript
await page.waitForSelector('#my-element', { timeout: 5000 });
```

## CI/CD 集成

### GitHub Actions 示例

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Run tests
        run: npx playwright test
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 最佳实践

1. **使用相对 URL**：使用 `/login` 而不是 `http://localhost:3000/login`
2. **避免硬编码等待**：使用 `waitForSelector` 而不是 `waitForTimeout`
3. **独立的测试**：每个测试应该独立，不依赖其他测试
4. **清理测试数据**：测试后清理创建的数据
5. **有意义的测试名称**：清楚描述测试的目的
6. **适当的断言**：验证关键的用户流程
7. **并行执行**：利用 Playwright 的并行能力加速测试

## 与 Cypress 对比

| 特性 | Playwright | Cypress |
|------|-----------|---------|
| 多浏览器支持 | ✅ Chromium, Firefox, WebKit | ⚠️ 主要是 Chromium |
| 并行执行 | ✅ 内置支持 | ⚠️ 需要 Dashboard |
| 自动等待 | ✅ 智能等待 | ✅ 智能等待 |
| 网络拦截 | ✅ 强大 | ✅ 良好 |
| 移动端测试 | ✅ 设备模拟 | ❌ 不支持 |
| 学习曲线 | 中等 | 较低 |
| 社区 | 快速增长 | 成熟 |

本项目同时使用 Cypress 和 Playwright：
- **Cypress**: `cypress/e2e/` - 主要的 E2E 测试
- **Playwright**: `tests/` - 补充测试和跨浏览器测试

## 资源

- [Playwright 官方文档](https://playwright.dev/)
- [Playwright API 参考](https://playwright.dev/docs/api/class-playwright)
- [测试最佳实践](https://playwright.dev/docs/best-practices)
- [调试指南](https://playwright.dev/docs/debug)

---

**最后更新**: 2024-04-23  
**维护者**: SkillHub Team

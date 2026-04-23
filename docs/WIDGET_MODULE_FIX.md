# Widget 模块导入错误修复

## 问题描述

访问 `/widget-demo` 页面时出现以下错误：

```
Module not found: Can't resolve '@skillhub/widget'
```

## 根本原因

1. **Widget 包未构建**：`packages/widget` 目录缺少 `dist/` 构建产物
2. **Web 应用依赖缺失**：`apps/web/package.json` 中未声明 `@skillhub/widget` 依赖
3. **Next.js 缓存问题**：旧的 `.next` 缓存导致模块解析失败

## 解决方案

### 1. 构建 Widget 包

```bash
cd packages/widget
npm install
npm run build
```

构建成功后生成：
- `dist/index.js` (CommonJS)
- `dist/index.mjs` (ES Module)
- `dist/index.d.ts` (TypeScript 类型定义)

### 2. 添加 Web 应用依赖

在 `apps/web/package.json` 中添加：

```json
{
  "dependencies": {
    "@skillhub/search-sdk": "*",
    "@skillhub/widget": "*"
  }
}
```

然后运行：

```bash
cd ../..
npm install
```

### 3. 清除 Next.js 缓存

```bash
cd apps/web
Remove-Item -Recurse -Force .next  # Windows
# 或
rm -rf .next  # Linux/Mac
```

### 4. 重启开发服务器

停止当前的 `npm run dev` 进程，然后重新启动：

```bash
npm run dev
```

## 验证步骤

### 方法 1: Node.js 测试脚本

创建测试文件 `test-widget-import.js`：

```javascript
try {
  const widget = require('@skillhub/widget');
  console.log('✅ @skillhub/widget 导入成功!');
  console.log('导出的组件:', Object.keys(widget));
} catch (error) {
  console.error('❌ @skillhub/widget 导入失败:');
  console.error(error.message);
  process.exit(1);
}
```

运行测试：

```bash
node test-widget-import.js
```

预期输出：

```
✅ @skillhub/widget 导入成功!
导出的组件: [
  'MySkillsManager',
  'SkillSearchWidget',
  'SkillStoreWidget',
  'useMySkills',
  'useSkillSearch'
]
```

### 方法 2: 浏览器访问

访问 `http://localhost:3000/widget-demo`，页面应该正常加载，不再显示模块找不到的错误。

## NPM Workspace 工作原理

本项目使用 NPM Workspaces 管理 monorepo：

```
skillhub/
├── package.json          # 根配置，包含 workspaces 定义
├── packages/
│   └── widget/           # @skillhub/widget 包
│       ├── package.json  # name: "@skillhub/widget"
│       └── dist/         # 构建产物
└── apps/
    └── web/              # web 应用
        └── package.json  # 依赖 "@skillhub/widget": "*"
```

当运行 `npm install` 时：
1. NPM 识别 workspace 配置
2. 自动将 `packages/widget` 链接到 `apps/web/node_modules/@skillhub/widget`
3. 创建符号链接（symlink）而非复制文件

验证链接：

```bash
npm list @skillhub/widget
```

输出应显示：

```
skillhub@1.0.0 D:\BigLionX\SkillHub
└─┬ web@1.0.0 -> .\apps\web
  └── @skillhub/widget@1.0.0 -> .\packages\widget
```

箭头 `->` 表示这是一个 workspace 链接。

## 常见问题

### Q1: 修改 Widget 源码后需要重新构建吗？

**是的**。每次修改 `packages/widget/src/` 下的代码后，都需要重新构建：

```bash
cd packages/widget
npm run build
```

或者使用 watch 模式（开发时推荐）：

```bash
npm run dev  # 自动监听变化并重新构建
```

### Q2: 为什么使用 `"*"` 作为版本号？

在 monorepo 中，使用 `"*"` 表示：
- 始终使用 workspace 中的本地版本
- 不关心具体版本号
- 便于开发和调试

生产环境发布时，应该使用具体的版本号，如 `"^1.0.0"`。

### Q3: 构建失败怎么办？

检查以下几点：

1. **依赖是否安装**：
   ```bash
   npm install --workspace=@skillhub/widget
   ```

2. **tsup 是否可用**：
   ```bash
   npx tsup --version
   ```

3. **TypeScript 配置是否正确**：
   检查 `packages/widget/tsconfig.json`

4. **查看完整错误信息**：
   ```bash
   npm run build 2>&1 | tee build.log
   ```

### Q4: 模块找到但运行时出错？

可能是 React 版本冲突。确保：
- Widget 包的 `peerDependencies` 正确声明 React 版本
- Web 应用的 React 版本满足要求

检查：

```bash
npm list react
npm list react-dom
```

## 预防措施

### 1. 添加到 CI/CD 流程

在构建流程中确保先构建依赖包：

```yaml
# .github/workflows/build.yml
steps:
  - name: Build packages
    run: |
      npm run build --workspace=@skillhub/search-sdk
      npm run build --workspace=@skillhub/widget
  
  - name: Build web app
    run: npm run build --workspace=web
```

### 2. 使用 Turbo 优化构建顺序

如果项目使用 Turborepo，可以在 `turbo.json` 中配置依赖：

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

这样会自动按依赖顺序构建。

### 3. 添加 prebuild 钩子

在 `apps/web/package.json` 中添加：

```json
{
  "scripts": {
    "prebuild": "npm run build --workspace=@skillhub/widget",
    "build": "next build"
  }
}
```

这样每次构建 web 应用前会自动构建 widget 包。

## 相关文件

- Widget 包源码：`packages/widget/src/`
- Widget 包配置：`packages/widget/package.json`
- Widget 入口文件：`packages/widget/src/index.ts`
- Web 应用依赖：`apps/web/package.json`
- 演示页面：`apps/web/app/widget-demo/page.tsx`

## 更新日志

- **2026-04-23**: 初始文档创建，修复模块导入错误

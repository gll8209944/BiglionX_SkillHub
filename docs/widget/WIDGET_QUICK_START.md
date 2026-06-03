# SkillHub Widget 快速启动指南

## 🚀 5分钟快速开始

### 第一步：安装依赖

```bash
cd packages/widget
npm install
```

### 第二步：构建 Widget 包

```bash
npm run build
```

这会生成 `dist/` 目录，包含编译后的文件。

### 第三步：在 web 应用中测试

1. **启动开发服务器**（如果尚未启动）：
```bash
cd apps/web
npm run dev
```

2. **访问演示页面**：
打开浏览器访问：`http://localhost:3000/widget-demo`

您将看到三个演示标签：
- 🏪 完整 Skill 商店
- 🔍 仅搜索组件
- 📦 Skills 管理器

### 第四步：在自己的项目中集成

#### 方法 1: 本地链接（开发阶段）

```bash
# 在 packages/widget 目录
cd packages/widget
npm link

# 在您的项目目录
cd your-project
npm link @skillhub/widget
```

#### 方法 2: 直接引用（推荐用于 monorepo）

在您的项目的 `package.json` 中添加：

```json
{
  "dependencies": {
    "@skillhub/widget": "workspace:*",
    "@skillhub/search-sdk": "workspace:*"
  }
}
```

然后运行：
```bash
npm install
```

## 💻 代码示例

### 最简单的用法

```tsx
import { SkillStoreWidget } from '@skillhub/widget';

function App() {
  return (
    <div className="p-6">
      <SkillStoreWidget />
    </div>
  );
}
```

### 自定义配置

```tsx
import { SkillStoreWidget } from '@skillhub/widget';

function App() {
  return (
    <SkillStoreWidget
      apiUrl="http://localhost:3000/api"
      authToken="your-auth-token"
      defaultView="search"
      theme={{
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        borderColor: '#e5e7eb',
        borderRadius: '0.5rem',
      }}
      onSearchComplete={(results) => {
        console.log('找到', results.length, '个结果');
      }}
      onSkillClick={(skill) => {
        console.log('点击了:', skill.name);
      }}
    />
  );
}
```

### 仅使用搜索组件

```tsx
import { SkillSearchWidget } from '@skillhub/widget';

function SearchPage() {
  return (
    <SkillSearchWidget
      apiUrl="http://localhost:3000/api"
      placeholder="搜索 AI 技能..."
      showAdvancedFilter={true}
      onSkillClick={(skill) => {
        // 处理点击事件
        navigateToSkill(skill.slug);
      }}
    />
  );
}
```

### 使用 Hooks（高级用法）

```tsx
import { useSkillSearch, useMySkills } from '@skillhub/widget';

function CustomComponent() {
  const { results, loading, search } = useSkillSearch({
    apiUrl: 'http://localhost:3000/api',
  });

  const { skills, addSkill } = useMySkills();

  const handleSearch = async () => {
    const results = await search({ query: 'python' });
    console.log(results);
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        搜索
      </button>
      {/* 渲染结果 */}
    </div>
  );
}
```

## 🎨 主题定制示例

### 深色主题

```tsx
<SkillStoreWidget
  theme={{
    primaryColor: '#60a5fa',
    backgroundColor: '#1f2937',
    textColor: '#f3f4f6',
    borderColor: '#374151',
    borderRadius: '0.75rem',
  }}
/>
```

### 品牌定制

```tsx
<SkillStoreWidget
  theme={{
    primaryColor: '#ff6b6b',  // 你的品牌色
    borderRadius: '1rem',
    fontSize: 'lg',
  }}
/>
```

## 🔧 常见问题

### Q1: 如何修改 API 地址？

```tsx
<SkillStoreWidget
  apiUrl="https://your-skillhub-instance.com/api"
/>
```

### Q2: 如何获取认证 Token？

Token 需要从您的 SkillHub 后端获取，通常通过登录接口：

```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});
const { token } = await response.json();
```

### Q3: 如何禁用某些功能？

```tsx
<MySkillsManager
  allowPublish={false}  // 禁用发布
  allowEdit={false}     // 禁用编辑
  allowDelete={false}   // 禁用删除
/>
```

### Q4: 如何处理错误？

组件会自动显示错误提示，您也可以通过回调处理：

```tsx
<SkillSearchWidget
  onSearchComplete={(results) => {
    if (results.length === 0) {
      showNoResultsMessage();
    }
  }}
/>
```

### Q5: 数据保存在哪里？

"My Skills" 的数据保存在浏览器的 `localStorage` 中，键名为 `my_skills`。

## 📱 移动端适配

Widget 已经内置响应式设计，无需额外配置。在不同屏幕尺寸下会自动调整布局。

## 🐛 调试技巧

### 查看控制台日志

组件会输出详细的日志信息：

```javascript
// 在浏览器控制台中
console.log('搜索完成:', results.length, '个结果');
console.log('点击 Skill:', skill.name);
```

### 检查网络请求

打开浏览器开发者工具的 Network 标签，查看 API 请求：
- `/api/skills` - 搜索请求
- `/api/skills` (POST) - 发布请求

### 查看本地存储

在浏览器控制台中：

```javascript
// 查看保存的 Skills
JSON.parse(localStorage.getItem('my_skills'));

// 清除所有 Skills
localStorage.removeItem('my_skills');
```

## 📚 更多资源

- 📖 [完整文档](../packages/widget/README.md)
- 💡 [使用示例](../packages/widget/examples/usage-examples.tsx)
- 🎨 [演示页面](http://localhost:3000/widget-demo)
- 🐛 [问题反馈](https://github.com/skillhub/skillhub/issues)

## 🎉 开始构建吧！

现在您已经掌握了基础知识，可以开始在自己的项目中集成 SkillHub Widget 了！

如有任何问题，欢迎查阅文档或提交 Issue。

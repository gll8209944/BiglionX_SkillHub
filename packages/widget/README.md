# @skillhub/widget

SkillHub 嵌入式组件库 - 为您的应用集成 Skill 搜索和管理功能

## 🎯 功能特性

- 🔍 **SkillSearchWidget** - 带搜索窗的轻量级组件，支持全文搜索和语义搜索
- 📦 **MySkillsManager** - "我的 Skills" 管理器，支持本地管理和发布到 SkillHub
- 🏪 **SkillStoreWidget** - 完整的 Skill 商店组件，包含搜索和管理功能
- ⚡ **React Hooks** - `useSkillSearch` 和 `useMySkills` 提供灵活的编程式 API
- 🎨 **主题定制** - 支持自定义颜色、圆角等样式
- 📱 **响应式设计** - 完美适配桌面和移动设备

## 📦 安装

```bash
npm install @skillhub/widget @skillhub/search-sdk
```

或

```bash
yarn add @skillhub/widget @skillhub/search-sdk
```

## 🚀 快速开始

### 1. 基础搜索组件

```tsx
import { SkillSearchWidget } from '@skillhub/widget';

function App() {
  return (
    <SkillSearchWidget
      apiUrl="https://api.skillhub.com"
      placeholder="搜索 AI 技能..."
      showAdvancedFilter={true}
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

### 2. 我的 Skills 管理器

```tsx
import { MySkillsManager } from '@skillhub/widget';

function App() {
  return (
    <MySkillsManager
      apiUrl="https://api.skillhub.com"
      authToken="your-auth-token"
      allowPublish={true}
      onSkillUpdate={() => {
        console.log('Skill 已更新');
      }}
      onSkillPublish={(skillId) => {
        console.log('Skill 已发布:', skillId);
      }}
    />
  );
}
```

### 3. 完整 Skill 商店

```tsx
import { SkillStoreWidget } from '@skillhub/widget';

function App() {
  return (
    <SkillStoreWidget
      apiUrl="https://api.skillhub.com"
      authToken="your-auth-token"
      defaultView="search"
      showTabs={true}
      theme={{
        primaryColor: '#3b82f6',
        borderRadius: '0.5rem',
      }}
    />
  );
}
```

### 4. 使用 Hooks（高级用法）

```tsx
import { useSkillSearch, useMySkills } from '@skillhub/widget';

function CustomSearchComponent() {
  const { results, loading, search } = useSkillSearch({
    apiUrl: 'https://api.skillhub.com',
  });

  const { skills, addSkill, publishSkill } = useMySkills();

  const handleSearch = async () => {
    const results = await search({ query: 'python automation' });
    console.log(results);
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? '搜索中...' : '搜索'}
      </button>
      
      <ul>
        {results.map(skill => (
          <li key={skill.id}>{skill.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 📖 API 文档

### SkillSearchWidget Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| apiUrl | string | 'http://localhost:3000/api' | SkillHub API 地址 |
| placeholder | string | '搜索 AI 技能...' | 搜索框占位符 |
| showAdvancedFilter | boolean | false | 是否显示高级筛选 |
| showResults | boolean | true | 是否显示搜索结果 |
| pageSize | number | 20 | 每页数量 |
| theme | WidgetTheme | - | 主题配置 |
| onSearchComplete | (results) => void | - | 搜索完成回调 |
| onSkillClick | (skill) => void | - | 点击 Skill 回调 |

### MySkillsManager Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| apiUrl | string | 'http://localhost:3000/api' | SkillHub API 地址 |
| authToken | string | - | 用户认证 Token |
| allowPublish | boolean | true | 是否允许发布 |
| allowEdit | boolean | true | 是否允许编辑 |
| allowDelete | boolean | true | 是否允许删除 |
| theme | WidgetTheme | - | 主题配置 |
| onSkillUpdate | () => void | - | Skill 更新回调 |
| onSkillPublish | (skillId) => void | - | Skill 发布回调 |

### SkillStoreWidget Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| apiUrl | string | 'http://localhost:3000/api' | SkillHub API 地址 |
| authToken | string | - | 用户认证 Token（可选） |
| defaultView | 'search' \| 'my-skills' | 'search' | 默认视图 |
| showTabs | boolean | true | 是否显示标签切换 |
| theme | WidgetTheme | - | 主题配置 |
| ...其他回调 | - | - | 继承自上述两个组件 |

### WidgetTheme

```typescript
interface WidgetTheme {
  primaryColor?: string;      // 主色调
  backgroundColor?: string;   // 背景色
  textColor?: string;         // 文字颜色
  borderColor?: string;       // 边框颜色
  borderRadius?: string;      // 圆角大小
  fontSize?: 'sm' | 'md' | 'lg'; // 字体大小
}
```

## 💡 使用场景

### 场景 1: 开发者工具集成

在您的 AI Agent 开发工具中嵌入 Skill 搜索功能，让开发者可以快速查找和复用现有的 Skills。

```tsx
<SkillSearchWidget
  apiUrl="https://api.skillhub.com"
  onSkillClick={(skill) => {
    // 将选中的 Skill 添加到项目中
    addToProject(skill);
  }}
/>
```

### 场景 2: 企业内部 Skill 管理

企业可以部署私有的 SkillHub 实例，让员工管理内部的 Skills。

```tsx
<MySkillsManager
  apiUrl="https://internal-skillhub.company.com"
  authToken={userToken}
  onSkillPublish={(skillId) => {
    // 通知团队新 Skill 已发布
    notifyTeam(skillId);
  }}
/>
```

### 场景 3: 教育平台

在教育平台中集成 Skill 商店，让学生学习和实践 AI Agent 开发。

```tsx
<SkillStoreWidget
  apiUrl="https://edu-skillhub.com"
  defaultView="search"
  theme={{
    primaryColor: '#10b981',
    borderRadius: '1rem',
  }}
/>
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

## 📝 注意事项

1. **API 地址**: 确保 `apiUrl` 指向正确的 SkillHub 实例
2. **认证 Token**: 使用 `MySkillsManager` 时需要提供有效的 `authToken`
3. **本地存储**: Skills 数据存储在浏览器的 localStorage 中
4. **发布功能**: 发布到 SkillHub 需要后端 API 支持和有效的认证

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

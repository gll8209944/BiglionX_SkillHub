# 前端搜索UI - 快速启动指南

## 🚀 立即开始

### 1. 启动开发服务器

```bash
cd apps/web
npm run dev
```

### 2. 访问搜索页面

在浏览器中打开:
```
http://localhost:3000/skills
```

---

## 🎯 核心功能演示

### ✨ 搜索框（带自动完成）

**位置**: 页面顶部Hero区域

**使用方法**:
1. 在搜索框输入至少2个字符（例如："ai"）
2. 等待300ms，自动显示搜索建议
3. 点击建议项或按回车执行搜索

**特性**:
- ✅ 实时建议（技能、分类、标签）
- ✅ 防抖处理（减少API调用）
- ✅ 点击外部自动关闭
- ✅ ESC键关闭建议

---

### 🔍 高级筛选面板

**位置**: 页面左侧边栏

**使用方法**:
1. 点击"展开高级选项"
2. 选择筛选条件：
   - 排序方式（相关性、质量、更新时间等）
   - 分类（AI/ML、开发工具等）
   - 子分类（AI代理、LLM工具等）
   - 编程语言
   - 数据源
   - 最低质量评分
3. 点击"应用筛选"按钮

**特性**:
- ✅ 多维度组合筛选
- ✅ 活跃筛选标签展示
- ✅ 一键清除所有筛选
- ✅ 筛选条件同步到URL

---

### 📄 分页组件

**位置**: 页面底部

**使用方法**:
1. 滚动到页面底部
2. 点击页码跳转到指定页
3. 使用上一页/下一页按钮导航

**特性**:
- ✅ 智能页码显示（最多7个）
- ✅ 省略号处理
- ✅ 结果范围显示
- ✅ 当前页高亮

---

## 🧪 测试场景

### 场景1: 基本搜索
```
1. 在搜索框输入 "agent"
2. 查看搜索建议
3. 点击第一个建议
4. 验证搜索结果正确显示
```

### 场景2: 高级筛选
```
1. 展开高级选项
2. 选择分类: "development"
3. 选择排序: "质量评分"
4. 设置最低质量: "80分以上"
5. 点击"应用筛选"
6. 验证结果符合筛选条件
```

### 场景3: 组合搜索
```
1. 搜索关键词: "ai"
2. 筛选分类: "AI/ML"
3. 筛选语言: "Python"
4. 排序: "最近更新"
5. 验证URL包含所有参数
```

### 场景4: 分页导航
```
1. 确保有足够多的结果（>20条）
2. 点击第2页
3. 验证页码高亮
4. 点击"上一页"返回第1页
```

### 场景5: 清除筛选
```
1. 应用多个筛选条件
2. 点击"清除"按钮
3. 验证所有筛选被移除
4. 验证URL参数清空
```

---

## 🎨 UI组件说明

### SearchBox 组件

**文件**: `components/ui/SearchBox.tsx`

**Props**:
```typescript
interface SearchBoxProps {
  placeholder?: string;  // 占位符文本
  className?: string;    // 自定义CSS类
}
```

**使用示例**:
```tsx
<SearchBox 
  placeholder="搜索技能名称、描述或标签..." 
/>
```

---

### SkillCard 组件

**文件**: `components/ui/SkillCard.tsx`

**Props**:
```typescript
interface SkillCardProps {
  name: string;
  slug: string;
  description: string;
  subcategory?: string | null;
  tags?: string[] | null;
  qualityScore?: number | null;
  starCount?: number;
  downloadCount?: number;
  author?: { name: string | null; image: string | null; } | null;
  namespace?: { name: string; } | null;
  updatedAt?: string;
}
```

**使用示例**:
```tsx
<SkillCard
  name="AI Agent Pro"
  slug="ai-agent-pro"
  description="Advanced AI agent framework"
  qualityScore={85}
  starCount={1234}
  downloadCount={567}
/>
```

---

### AdvancedFilterPanel 组件

**文件**: `components/ui/AdvancedFilterPanel.tsx`

**Props**:
```typescript
interface AdvancedFilterPanelProps {
  categories?: FilterOption[];
  subcategories?: FilterOption[];
  languages?: FilterOption[];
  sources?: FilterOption[];
  className?: string;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}
```

**使用示例**:
```tsx
<AdvancedFilterPanel
  categories={[
    { value: 'development', label: '开发工具', count: 45 },
    { value: 'ai_ml', label: 'AI/ML', count: 32 },
  ]}
/>
```

---

### Pagination 组件

**文件**: `components/ui/Pagination.tsx`

**Props**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  className?: string;
}
```

**使用示例**:
```tsx
<Pagination
  currentPage={1}
  totalPages={10}
  totalItems={200}
  pageSize={20}
/>
```

---

## 🔗 API端点

### 搜索建议
```
GET /api/search/suggestions?q={query}&limit=5
```

**响应**:
```json
{
  "suggestions": [
    { "text": "AI Agent", "type": "skill" },
    { "text": "development", "type": "category" },
    { "text": "ai-agent", "type": "tag" }
  ]
}
```

### 热门搜索
```
GET /api/search/popular?limit=10
```

**响应**:
```json
{
  "popularSearches": ["agent", "automation", "chatbot"]
}
```

### 基本搜索
```
GET /api/search?q={query}&category={cat}&page=1&pageSize=20&sortBy=relevance
```

### 高级搜索
```
POST /api/search
Content-Type: application/json

{
  "query": "agent",
  "categories": ["development"],
  "languages": ["Python"],
  "minQualityScore": 70,
  "page": 1,
  "pageSize": 20
}
```

---

## 🐛 常见问题

### Q1: 搜索建议不显示？
**A**: 检查以下几点：
1. 确保输入至少2个字符
2. 检查开发服务器是否运行
3. 打开浏览器控制台查看网络请求
4. 验证API端点是否正常：`curl http://localhost:3000/api/search/suggestions?q=test`

### Q2: 筛选条件不生效？
**A**: 
1. 确认点击了"应用筛选"按钮
2. 检查URL参数是否正确更新
3. 刷新页面验证筛选持久化

### Q3: 分页链接错误？
**A**: 
1. 确保总结果数 > 每页数量
2. 检查URL中的page参数
3. 验证其他筛选参数被保留

### Q4: 样式显示异常？
**A**: 
1. 清除浏览器缓存
2. 重启开发服务器
3. 检查Tailwind CSS是否正确编译

---

## 📱 响应式测试

### 断点
- **移动端**: < 768px (单列布局)
- **平板**: 768px - 1024px (双列布局)
- **桌面**: > 1024px (三列布局 + 侧边栏)

### 测试方法
```
1. 打开Chrome DevTools
2. 点击设备工具栏图标
3. 选择不同设备尺寸
4. 验证布局和交互正常
```

---

## 🎯 性能指标

### 目标
- 首屏加载时间: < 2秒
- 搜索建议响应: < 100ms
- 搜索结果加载: < 200ms
- 分页切换: < 100ms

### 优化建议
1. 启用Next.js图片优化
2. 使用React.memo包裹纯组件
3. 实现虚拟滚动（大数据集）
4. 添加Service Worker缓存

---

## 📚 相关文档

- [搜索系统实施报告](./SEARCH_SYSTEM_IMPLEMENTATION.md)
- [前端搜索UI实施报告](./FRONTEND_SEARCH_UI_IMPLEMENTATION.md)
- [全局搜索架构设计](./docs/GLOBAL_SKILLS_SEARCH_PLAN.md)

---

## ✅ 检查清单

部署前确认：
- [ ] 所有组件无TypeScript错误
- [ ] 搜索建议正常工作
- [ ] 筛选功能完整可用
- [ ] 分页导航正确
- [ ] 响应式布局正常
- [ ] 无控制台错误
- [ ] Lighthouse分数 > 90

---

**最后更新**: 2026-04-18  
**版本**: v1.0.0  
**状态**: ✅ 生产就绪

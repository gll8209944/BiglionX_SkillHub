# 搜索功能增强 - 快速使用指南

## 🚀 新增功能概览

### ✨ 三大增强功能

1. **更多筛选维度** - 许可证、Stars范围、日期范围
2. **搜索历史记录** - localStorage持久化存储
3. **骨架屏加载** - 优雅的加载状态

---

## 📋 新功能使用说明

### 1️⃣ 更多筛选维度

#### 许可证类型筛选

**位置**: 高级筛选面板 → 展开高级选项

**操作步骤**:
1. 点击"展开高级选项"
2. 找到"许可证类型"下拉框
3. 选择许可证（MIT、Apache-2.0等）
4. 点击"应用筛选"

**URL示例**:
```
/skills?license=MIT
```

---

#### Stars范围筛选

**位置**: 高级筛选面板 → Stars范围

**操作步骤**:
1. 展开高级选项
2. 输入最小Stars数（例如：100）
3. 输入最大Stars数（例如：1000，留空表示不限）
4. 点击"应用筛选"

**URL示例**:
```
/skills?minStars=100&maxStars=1000
/skills?minStars=500        # 只有最小值
/skills?maxStars=1000       # 只有最大值
```

**显示效果**:
- 活跃标签显示: "Stars: 100-1000"
- 颜色: 粉红色背景

---

#### 更新日期范围筛选

**位置**: 高级筛选面板 → 更新日期范围

**操作步骤**:
1. 展开高级选项
2. 点击"从"日期选择器，选择开始日期
3. 点击"到"日期选择器，选择结束日期
4. 点击"应用筛选"

**URL示例**:
```
/skills?dateFrom=2026-01-01&dateTo=2026-04-18
/skills?dateFrom=2026-01-01    # 从某日期开始
/skills?dateTo=2026-04-18      # 到某日期为止
```

**显示效果**:
- 活跃标签显示: "2026-01-01 至 2026-04-18"
- 颜色: 青色背景

---

### 2️⃣ 搜索历史记录

#### 查看搜索历史

**位置**: Hero区域搜索框上方右侧

**操作步骤**:
1. 执行几次搜索（例如："ai agent", "automation"）
2. 点击"🕒 历史"按钮
3. 查看下拉面板中的历史记录
4. 点击任意历史项直接跳转

**特性**:
- ✅ 最多保存10条记录
- ✅ 自动去重（相同查询更新为最新时间）
- ✅ 智能时间显示（刚刚、5分钟前、2小时前等）
- ✅ 悬停显示删除按钮
- ✅ 一键清空所有历史

---

#### 管理历史记录

**删除单条记录**:
1. 打开历史面板
2. 悬停在要删除的记录上
3. 点击右侧的 × 按钮

**清空所有历史**:
1. 打开历史面板
2. 点击右上角"清空"按钮
3. 确认清空

**存储位置**:
- 浏览器localStorage
- Key: `skillhub_search_history`
- 数据格式: JSON数组

---

#### 编程方式使用

```typescript
import { addSearchHistory, clearSearchHistory } from '@/components/ui/SearchHistory';

// 添加搜索历史
addSearchHistory('my custom search');

// 清除所有历史
clearSearchHistory();
```

---

### 3️⃣ 骨架屏加载状态

#### 自动显示

骨架屏会在以下场景自动显示：
- 页面首次加载
- 切换筛选条件
- 翻页时

**无需手动调用**，系统会自动管理加载状态。

---

#### 手动使用（开发者）

```typescript
import { 
  FullPageSkeleton, 
  SkillsSkeleton, 
  FilterPanelSkeleton,
  SearchBoxSkeleton,
  HeroSkeleton 
} from '@/components/ui/SkeletonLoader';

// 完整页面骨架屏
if (loading) {
  return <FullPageSkeleton />;
}

// 仅卡片骨架屏
if (loadingSkills) {
  return <SkillsSkeleton count={6} />;
}

// 仅筛选面板骨架屏
if (loadingFilters) {
  return <FilterPanelSkeleton />;
}
```

---

## 🎯 组合使用示例

### 示例1: 查找高质量的Python AI项目

```
1. 搜索关键词: "ai"
2. 展开高级选项
3. 分类: "AI/ML"
4. 语言: "Python"
5. 最低质量: "80分以上"
6. Stars范围: 100-∞
7. 许可证: "MIT"
8. 点击"应用筛选"
```

**生成的URL**:
```
/skills?q=ai&category=ai_ml&language=Python&minQuality=80&minStars=100&license=MIT
```

---

### 示例2: 查找最近更新的自动化工具

```
1. 搜索关键词: "automation"
2. 展开高级选项
3. 分类: "自动化"
4. 更新日期: 从 2026-03-01 到现在
5. 排序: "最近更新"
6. 点击"应用筛选"
```

**生成的URL**:
```
/skills?q=automation&category=automation&dateFrom=2026-03-01&sortBy=updated
```

---

### 示例3: 利用搜索历史快速访问

```
1. 第一次搜索: "chatbot framework"
2. 第二次搜索: "workflow automation"
3. 第三次搜索: "data pipeline"
4. 点击"历史"按钮
5. 看到三条记录
6. 点击"chatbot framework"快速返回
```

---

## 🔍 筛选参数速查表

| 筛选条件 | URL参数 | 示例 | 说明 |
|---------|---------|------|------|
| 搜索词 | `q` | `q=ai+agent` | 关键词搜索 |
| 分类 | `category` | `category=development` | 主分类 |
| 子分类 | `subcategory` | `subcategory=ai_agent` | 子分类 |
| 语言 | `language` | `language=Python` | 编程语言 |
| 数据源 | `source` | `source=github` | 数据来源 |
| 许可证 | `license` | `license=MIT` | ⭐新增 |
| 质量评分 | `minQuality` | `minQuality=80` | 最低分数 |
| 最小Stars | `minStars` | `minStars=100` | ⭐新增 |
| 最大Stars | `maxStars` | `maxStars=1000` | ⭐新增 |
| 开始日期 | `dateFrom` | `dateFrom=2026-01-01` | ⭐新增 |
| 结束日期 | `dateTo` | `dateTo=2026-04-18` | ⭐新增 |
| 排序方式 | `sortBy` | `sortBy=relevance` | 排序字段 |
| 页码 | `page` | `page=1` | 当前页 |

---

## 💡 最佳实践

### 1. 高效搜索技巧

**精确搜索**:
```
使用引号搜索完整短语: "ai agent framework"
```

**组合筛选**:
```
先使用关键词缩小范围，再用筛选精确定位
```

**保存常用搜索**:
```
将常用的筛选组合加入书签或记录在搜索历史中
```

---

### 2. 筛选策略

**由粗到细**:
1. 先用分类过滤大范围
2. 再用关键词搜索
3. 最后用Stars、日期等精细筛选

**避免过度筛选**:
- 同时使用太多筛选条件可能导致结果为空
- 建议每次增加1-2个筛选条件

---

### 3. 历史管理

**定期清理**:
- 过时的搜索记录可以手动删除
- 保持历史记录的相关性

**利用历史**:
- 重复搜索时直接使用历史记录
- 节省输入时间

---

## 🐛 常见问题

### Q1: 为什么搜索历史没有保存？
**A**: 检查以下几点：
1. 浏览器是否禁用了localStorage
2. 是否在隐私模式下（某些浏览器隐私模式禁用localStorage）
3. 打开控制台查看是否有错误信息

---

### Q2: Stars范围筛选没有结果？
**A**: 可能原因：
1. 设置的范围太窄，尝试扩大范围
2. 数据库中该范围的Skills较少
3. 结合其他筛选条件导致结果为空

**解决**: 逐步减少筛选条件，找出问题所在

---

### Q3: 日期筛选不生效？
**A**: 注意：
1. 日期格式必须是 YYYY-MM-DD
2. "从"日期应该早于"到"日期
3. 后端会根据updatedAt字段过滤

---

### Q4: 骨架屏一直显示？
**A**: 可能原因：
1. 网络请求失败
2. API响应超时
3. JavaScript错误

**解决**: 打开控制台检查网络请求和错误日志

---

### Q5: 如何清除所有筛选？
**A**: 两种方法：
1. 点击筛选面板右上角的"清除"按钮
2. 手动删除URL中的所有参数，只保留 `/skills`

---

## 📱 移动端适配

所有新功能都完全支持移动端：

- ✅ 筛选面板可滚动
- ✅ 日期选择器使用原生控件
- ✅ 历史面板适配小屏幕
- ✅ 触摸友好的按钮尺寸
- ✅ 响应式布局

---

## 🎨 自定义配置

### 修改历史记录数量

编辑 `apps/web/app/skills/page.tsx`:

```tsx
<SearchHistory maxItems={20} />  // 改为保存20条
```

### 调整骨架屏卡片数量

编辑组件使用处:

```tsx
<SkillsSkeleton count={9} />  // 显示9个骨架卡片
```

---

## 🔗 相关文档

- [前端搜索UI实施报告](./FRONTEND_SEARCH_UI_IMPLEMENTATION.md)
- [搜索系统实施报告](./SEARCH_SYSTEM_IMPLEMENTATION.md)
- [搜索功能增强报告](./SEARCH_ENHANCEMENTS_IMPLEMENTATION.md)

---

## ✅ 功能检查清单

使用前确认：
- [ ] 开发服务器正在运行
- [ ] 可以访问 `/skills` 页面
- [ ] 搜索框正常工作
- [ ] 高级筛选面板可展开
- [ ] 历史按钮可见
- [ ] 浏览器支持localStorage

---

**最后更新**: 2026-04-18  
**版本**: v2.0.0  
**状态**: ✅ 生产就绪

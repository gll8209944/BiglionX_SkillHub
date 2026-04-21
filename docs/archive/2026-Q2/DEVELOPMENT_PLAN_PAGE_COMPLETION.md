# SkillHub 开发计划 - 页面完整性修复与功能补全

## 📋 项目概述

**目标**: 基于项目说明书和现有代码审查，修复 SkillHub 项目中缺失和不完整的页面，确保所有核心功能完整可用。

**当前状态**: 
- ✅ Dashboard 路由已统一迁移到 `/dashboard`
- ✅ 核心 Skills 和 Namespaces 功能基本完成
- ✅ Monorepo 架构已搭建 (Turborepo)
- ❌ 多个关键页面缺失或为空
- ❌ 部分 API 路由不完整
- ❌ 管理后台页面缺失

**参考文档**:
- [README.md](./README.md) - 项目简介
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - 项目规划总结
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - Monorepo 开发计划
- [docs/SKILLHUB_DEVELOPMENT_PLAN_V2.md](./docs/SKILLHUB_DEVELOPMENT_PLAN_V2.md) - 详细技术方案
- [docs/SKILLHUB_QUICK_START_CHECKLIST.md](./docs/SKILLHUB_QUICK_START_CHECKLIST.md) - 快速启动清单

**预计工期**: 5-7 天

---

## 🎯 开发任务清单

### Phase 1: 高优先级 - 核心功能补全 (2-3 天)

#### Task 1.1: 创建注册页面 ⭐⭐⭐
**优先级**: P0 (必须)  
**预计时间**: 3-4 小时  
**文件**: `app/(auth)/register/page.tsx`

**需求**:
- [ ] 用户注册表单（邮箱、密码、确认密码）
- [ ] 表单验证（邮箱格式、密码强度）
- [ ] 与 NextAuth 集成
- [ ] 注册成功后跳转到登录页面或发送验证邮件
- [ ] 响应式设计
- [ ] 错误处理和用户提示
- [ ] 防止重复注册

**参考**: 
- 现有的 `app/(auth)/login/page.tsx`
- [SKILLHUB_QUICK_START_CHECKLIST.md](./docs/SKILLHUB_QUICK_START_CHECKLIST.md) Day 5-6 任务

---

#### Task 1.2: 完善 Namespaces Members API ⭐⭐⭐
**优先级**: P0 (必须)  
**预计时间**: 3-4 小时  
**文件**: `app/api/namespaces/[slug]/members/route.ts`

**需求**:
- [ ] GET - 获取命名空间成员列表
- [ ] POST - 邀请新成员
- [ ] DELETE - 移除成员
- [ ] PUT/PATCH - 更新成员角色
- [ ] 权限检查（只有 OWNER/ADMIN 可以管理成员）
- [ ] 邮箱邀请逻辑（可选：发送邀请邮件）

**前端已调用**:
- `/api/namespaces/{slug}/members` (GET, POST)
- `/api/namespaces/{slug}/members/{userId}` (DELETE)

---

#### Task 1.3: 修复 Skills 编辑页面数据获取 ⭐⭐
**优先级**: P1 (重要)  
**预计时间**: 1-2 小时  
**文件**: `app/dashboard/skills/[slug]/edit/page.tsx`

**问题**:
- 当前使用 `params.slug` 获取技能
- API 可能需要 ID 而不是 slug
- 需要验证 API 端点是否正确

**需求**:
- [ ] 验证 `/api/skills/{slug}` 是否支持 slug 查询
- [ ] 如果不支持，改为先通过 slug 获取 ID
- [ ] 测试编辑功能是否正常工作
- [ ] 更新表单提交逻辑

---

#### Task 1.4: 创建管理后台框架 ⭐⭐⭐
**优先级**: P0 (必须)  
**预计时间**: 4-6 小时  
**文件**: `app/admin/` 目录下的页面

**需求**:
根据 [SKILLHUB_QUICK_START_CHECKLIST.md](./docs/SKILLHUB_QUICK_START_CHECKLIST.md)，需要创建：
- [ ] `app/admin/layout.tsx` - 管理后台布局
- [ ] `app/admin/page.tsx` - 管理后台首页
- [ ] `app/admin/reviews/page.tsx` - 审核管理页面
- [ ] `app/admin/audit-logs/page.tsx` - 审计日志页面
- [ ] `app/admin/analytics/page.tsx` - 数据分析页面

**功能要求**:
- 只有管理员可以访问
- 显示待审核 Skills 列表
- 查看审计日志
- 平台数据统计

---

#### Task 1.5: 完善 Skills 公共浏览页面 ⭐⭐
**优先级**: P1 (重要)  
**预计时间**: 3-4 小时  
**文件**: `app/skills/page.tsx`, `app/skills/[slug]/page.tsx`

**需求**:
- [ ] Skills 市场首页（公开访问）
- [ ] Skill 详情页面（公开访问）
- [ ] 搜索和筛选功能
- [ ] 分类浏览
- [ ] 热门 Skills 展示
- [ ] SEO 优化

**注意**: 
- 与 `app/dashboard/skills/*` 区分
- Dashboard 中的是管理界面（需要登录）
- 这个是公开的市场页面（无需登录）

---

#### Task 1.2: 完善 Namespaces Members API ⭐⭐⭐
**优先级**: P0 (必须)  
**预计时间**: 3-4 小时  
**文件**: `app/api/namespaces/[slug]/members/route.ts`

**需求**:
- [ ] GET - 获取命名空间成员列表
- [ ] POST - 邀请新成员
- [ ] DELETE - 移除成员
- [ ] PUT/PATCH - 更新成员角色
- [ ] 权限检查（只有 OWNER/ADMIN 可以管理成员）
- [ ] 邮箱邀请逻辑（可选：发送邀请邮件）

**前端已调用**:
- `/api/namespaces/{slug}/members` (GET, POST)
- `/api/namespaces/{slug}/members/{userId}` (DELETE)

---

#### Task 1.3: 修复 Skills 编辑页面数据获取 ⭐⭐
**优先级**: P1 (重要)  
**预计时间**: 1-2 小时  
**文件**: `app/dashboard/skills/[slug]/edit/page.tsx`

**问题**:
- 当前使用 `params.slug` 获取技能
- API 可能需要 ID 而不是 slug
- 需要验证 API 端点是否正确

**需求**:
- [ ] 验证 `/api/skills/{slug}` 是否支持 slug 查询
- [ ] 如果不支持，改为先通过 slug 获取 ID
- [ ] 测试编辑功能是否正常工作
- [ ] 更新表单提交逻辑

---

### Phase 2: 中优先级 - 功能增强 (1-2 天)

#### Task 2.1: 创建 Analytics 分析页面 ⭐⭐
**优先级**: P2 (建议)  
**预计时间**: 4-6 小时  
**文件**: `app/dashboard/analytics/page.tsx`

**需求**:
- [ ] Skills 下载量统计图表
- [ ] 用户活跃度分析
- [ ] 热门 Skills 排行
- [ ] 命名空间使用情况
- [ ] 使用 Recharts 或 Chart.js 实现可视化
- [ ] 时间范围筛选（7天、30天、90天）

**数据来源**:
- Skills 下载记录
- 用户活动日志
- 版本发布统计

---

#### Task 2.2: 创建公开的 Skill 详情页面 ⭐⭐
**优先级**: P2 (建议)  
**预计时间**: 3-4 小时  
**文件**: `app/skills/[id]/page.tsx` 或 `app/skills/[slug]/page.tsx`

**需求**:
- [ ] 公开访问（不需要登录）
- [ ] 显示 Skill 基本信息
- [ ] 版本历史
- [ ] 下载按钮
- [ ] 作者信息
- [ ] 相关 Skills 推荐
- [ ] SEO 优化（meta tags）

**注意**: 
- 与 `app/dashboard/skills/[slug]/page.tsx` 区分
- 这个页面对所有用户可见
- Dashboard 中的页面需要登录且有编辑权限

---

#### Task 2.3: 完善 Reviews API ⭐
**优先级**: P2 (建议)  
**预计时间**: 2-3 小时  
**文件**: `app/api/reviews/` 下的路由

**需求**:
- [ ] GET `/api/reviews` - 获取评论列表
- [ ] POST `/api/reviews` - 创建评论
- [ ] GET `/api/reviews/[id]` - 获取单个评论
- [ ] PUT `/api/reviews/[id]` - 更新评论
- [ ] DELETE `/api/reviews/[id]` - 删除评论
- [ ] 权限控制（只能编辑自己的评论）

---

### Phase 3: 低优先级 - 优化和清理 (0.5-1 天)

#### Task 3.1: 清理旧的路由组 ⭐
**优先级**: P3 (可选)  
**预计时间**: 1 小时  

**需求**:
- [ ] 删除或归档 `app/(dashboard)` 目录
- [ ] 或者添加重定向到新的 `/dashboard` 路径
- [ ] 更新所有引用

---

#### Task 3.2: 添加加载状态和错误边界 ⭐
**优先级**: P3 (可选)  
**预计时间**: 2-3 小时  

**需求**:
- [ ] 统一的 Loading 组件
- [ ] 错误边界组件
- [ ] 网络错误重试机制
- [ ] 友好的错误提示

---

#### Task 3.3: 完善表单验证和用户体验 ⭐
**优先级**: P3 (可选)  
**预计时间**: 2-3 小时  

**需求**:
- [ ] 实时表单验证
- [ ] 自动保存草稿
- [ ] 键盘快捷键支持
- [ ] 无障碍访问优化 (a11y)

---

## 📊 技术栈

### 前端
- **框架**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + Lucide Icons
- **状态管理**: React Query (TanStack Query)
- **表单**: React Hook Form (可选)
- **图表**: Recharts 或 Chart.js

### 后端
- **API**: Next.js API Routes
- **数据库**: Prisma ORM + PostgreSQL (Neon)
- **认证**: NextAuth.js (JWT)
- **缓存**: Redis (可选)

---

## 🔍 验收标准

### 注册页面
- [ ] 用户可以成功注册账户
- [ ] 表单验证正常工作
- [ ] 重复邮箱检测
- [ ] 密码强度提示
- [ ] 注册后自动跳转到登录页

### Namespaces Members API
- [ ] 可以获取成员列表
- [ ] 可以邀请新成员
- [ ] 可以移除成员
- [ ] 权限检查正确
- [ ] 错误处理完善

### Skills 编辑页面
- [ ] 可以加载现有技能数据
- [ ] 可以修改并保存
- [ ] 表单验证正常
- [ ] 更新后跳转回详情页

### Analytics 页面
- [ ] 图表正确显示数据
- [ ] 时间筛选工作正常
- [ ] 数据实时更新
- [ ] 响应式布局

### 公开 Skill 详情页
- [ ] 无需登录即可访问
- [ ] 信息显示完整
- [ ] 下载功能正常
- [ ] SEO 友好

---

## 📝 实施步骤

### Day 1: 核心功能
1. **上午**: 创建注册页面 (Task 1.1)
2. **下午**: 完善 Namespaces Members API (Task 1.2)
3. **晚上**: 测试和修复 bug

### Day 2: 修复和优化
1. **上午**: 修复 Skills 编辑页面 (Task 1.3)
2. **下午**: 开始 Analytics 页面 (Task 2.1)
3. **晚上**: 继续 Analytics 开发

### Day 3: 功能增强
1. **上午**: 完成 Analytics 页面
2. **下午**: 创建公开 Skill 详情页 (Task 2.2)
3. **晚上**: 完善 Reviews API (Task 2.3)

### Day 4-5: 优化和测试
1. **清理旧代码** (Task 3.1)
2. **添加错误处理** (Task 3.2)
3. **全面测试**
4. **文档更新**

---

## 🚀 快速开始

### 1. 创建注册页面
```bash
# 创建文件
touch apps/web/app/\(auth\)/register/page.tsx
```

### 2. 创建 Namespaces Members API
```bash
# 创建目录结构
mkdir -p apps/web/app/api/namespaces/\[slug\]/members
```

### 3. 安装图表库（如果需要）
```bash
cd apps/web
npm install recharts
```

---

## 📌 注意事项

1. **保持一致性**: 新页面的样式和交互应与现有页面保持一致
2. **TypeScript**: 所有新代码必须使用 TypeScript
3. **错误处理**: 每个 API 调用都要有适当的错误处理
4. **权限控制**: 敏感操作必须进行权限验证
5. **响应式设计**: 所有页面都应支持移动端
6. **SEO**: 公开页面需要优化 SEO

---

## 🔗 相关文档

- [Next.js App Router](https://nextjs.org/docs/app)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## ✅ 进度跟踪

### Phase 1: 核心功能补全
- [ ] Task 1.1: 注册页面
- [ ] Task 1.2: Namespaces Members API
- [ ] Task 1.3: Skills 编辑页面修复
- [ ] Task 1.4: 管理后台框架
- [ ] Task 1.5: Skills 公共浏览页面

### Phase 2: 功能增强
- [ ] Task 2.1: Analytics 页面
- [ ] Task 2.2: 公开 Skill 详情页
- [ ] Task 2.3: Reviews API

### Phase 3: 优化清理
- [ ] Task 3.1: 清理旧路由
- [ ] Task 3.2: 错误边界
- [ ] Task 3.3: 表单优化

### Phase 4: 用户设置和优化 (新增)
- [x] Task 4.1: Settings 设置页面 ✅
- [ ] Task 4.2: 完善审核工作流
- [ ] Task 4.3: 优化错误处理和加载状态

### Phase 5: 文档和完善 (新增)
- [ ] Task 5.1: 完善项目文档

---

## 📊 项目完整性评估

根据详细的项目说明书审查，当前项目完成度约为 **85%**。

**已完成**:
- ✅ 基础设施搭建 (Monorepo, Next.js, Prisma, NextAuth)
- ✅ 核心业务逻辑 (Skills CRUD, Namespaces)
- ✅ 主要用户界面 (Dashboard, Skills 管理)
- ✅ CLI 工具 (publish, install, search, config)
- ✅ Settings 设置系统 (个人资料、安全、通知、API密钥)
- ✅ Analytics 数据分析页面
- ✅ 路由清理和重定向

**待完成**:
- ❌ 部分 API 路由后端实现 (API Keys, Password Change)
- ⚠️ 公共市场页面
- ⚠️ 审核工作流完整实现
- ⚠️ UX 组件全面应用 (Toast, Skeleton)
- ⚠️ 高级表单优化 (自动保存、快捷键)
- ⚠️ 文档完善

**详细审查报告**: 请查看 [PROJECT_COMPLETENESS_REVIEW.md](./PROJECT_COMPLETENESS_REVIEW.md)

---

**最后更新**: 2026-04-17  
**负责人**: Development Team  
**状态**: 待开始

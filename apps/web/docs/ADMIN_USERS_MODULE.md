# Admin 用户管理模块

## 概述

Admin 后台用户管理模块提供了完整的用户管理功能，包括用户列表、搜索筛选、详情查看和用户操作。

## 功能特性

### 1. 用户列表页面 (`/admin/users`)

#### 核心功能
- ✅ **用户列表展示**
  - 分页显示（每页 20 条）
  - 用户头像（支持默认头像）
  - 关键信息：姓名、邮箱、Skills 数量、API Keys 数量、注册时间、状态
  
- ✅ **搜索功能**
  - 支持按用户名搜索
  - 支持按邮箱搜索
  - 不区分大小写
  
- ✅ **筛选功能**
  - 全部状态
  - 已验证用户
  - 未验证用户
  
- ✅ **分页导航**
  - 上一页/下一页
  - 页码按钮（最多显示 5 个）
  - 智能页码显示逻辑
  - 保持搜索和筛选状态

#### 技术实现
- 服务器组件（Server Component）
- URL 参数驱动（page, search, status）
- Prisma 动态查询构建
- 响应式设计

### 2. 用户详情页面 (`/admin/users/[id]`)

#### 核心功能
- ✅ **用户基本信息**
  - 头像展示
  - 姓名、邮箱
  - 用户 ID
  - 注册/更新时间
  - 邮箱验证状态和时间
  
- ✅ **统计数据卡片**
  - Skills 数量
  - API Keys 数量
  - 审计日志数量
  - 审核记录数量
  
- ✅ **关联数据展示**
  - 最近创建的 5 个 Skills
  - 最近创建的 5 个 API Keys
  
- ✅ **操作按钮**（预留接口）
  - 编辑用户
  - 禁用账户

### 3. API 路由 (`/api/admin/users/[id]`)

#### 支持的端点

**PATCH /api/admin/users/[id]**
- 禁用用户账户
- 启用用户账户
- 手动验证邮箱
- 记录审计日志

**DELETE /api/admin/users/[id]**
- 删除用户（需检查关联数据）
- 级联删除相关数据
- 安全检查（有关联 Skills 时禁止删除）

### 4. 导航集成

#### Admin Layout 侧边栏
- 在"审核管理"和"审计日志"之间添加了"用户管理"菜单项
- 带有用户图标

#### Admin 首页快捷入口
- 在概览页面添加了用户管理卡片
- 点击可快速跳转到用户列表

## 文件结构

```
apps/web/app/admin/
├── users/
│   ├── page.tsx                    # 用户列表页面
│   └── [id]/
│       └── page.tsx                # 用户详情页面
├── layout.tsx                      # Admin 布局（已更新）
└── page.tsx                        # Admin 首页（已更新）

apps/web/app/api/admin/users/
└── [id]/
    └── route.ts                    # 用户管理 API
```

## 使用示例

### 访问用户列表
```
http://localhost:3001/admin/users
```

### 搜索用户
```
http://localhost:3001/admin/users?search=john
```

### 筛选已验证用户
```
http://localhost:3001/admin/users?status=verified
```

### 组合搜索和筛选
```
http://localhost:3001/admin/users?search=admin&status=verified&page=2
```

### 查看用户详情
```
http://localhost:3001/admin/users/{user-id}
```

## API 使用示例

### 禁用用户
```typescript
const response = await fetch('/api/admin/users/{user-id}', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'disable' }),
});
```

### 启用用户
```typescript
const response = await fetch('/api/admin/users/{user-id}', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'enable' }),
});
```

### 验证邮箱
```typescript
const response = await fetch('/api/admin/users/{user-id}', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'verify_email' }),
});
```

### 删除用户
```typescript
const response = await fetch('/api/admin/users/{user-id}', {
  method: 'DELETE',
});
```

## 安全考虑

1. **身份验证**
   - 所有页面和 API 都需要通过 `auth()` 验证
   - 未登录用户会被重定向到登录页面

2. **权限控制**（待实现）
   - 目前允许所有登录用户访问
   - 建议添加管理员角色检查
   - 取消注释 layout.tsx 中的角色检查代码

3. **审计日志**
   - 所有用户操作都会记录到审计日志
   - 包含操作人、操作时间、操作类型等信息

4. **数据保护**
   - 删除用户前检查关联数据
   - 防止误删有 Skills 的用户

## 后续优化建议

### 短期优化
1. 实现管理员角色检查
2. 添加批量操作功能（批量禁用/启用）
3. 添加用户导出功能（CSV/Excel）
4. 实现编辑用户信息功能

### 中期优化
1. 添加用户活动历史记录
2. 实现用户登录历史追踪
3. 添加用户标签/分组功能
4. 实现用户统计分析图表

### 长期优化
1. 添加用户行为分析
2. 实现自动化风险控制
3. 添加用户通知系统
4. 实现用户生命周期管理

## 技术栈

- **前端框架**: Next.js 14 (App Router)
- **UI 组件**: Tailwind CSS
- **数据库 ORM**: Prisma
- **数据库**: PostgreSQL
- **认证**: NextAuth.js
- **语言**: TypeScript

## 注意事项

1. **性能优化**
   - 用户列表使用了分页，避免一次性加载大量数据
   - 使用了 Prisma 的 `_count` 进行关联计数，减少查询次数
   
2. **用户体验**
   - 搜索和筛选使用服务端渲染，无需 JavaScript
   - 分页链接保持当前的搜索和筛选状态
   - 空状态友好提示

3. **可扩展性**
   - API 设计预留了扩展空间
   - 可以轻松添加新的用户操作
   - 筛选条件易于扩展

## 故障排查

### 问题：用户列表显示为空
- 检查数据库中是否有用户数据
- 确认 DATABASE_URL 配置正确
- 检查 Prisma Client 是否正确生成

### 问题：搜索功能不工作
- 确认 URL 参数正确传递
- 检查 Prisma 查询条件
- 查看浏览器控制台错误

### 问题：API 返回 401
- 确认用户已登录
- 检查 session 是否有效
- 查看 auth 配置

## 更新日志

### v1.0.0 (2026-04-19)
- ✅ 初始版本发布
- ✅ 用户列表页面（含搜索、筛选、分页）
- ✅ 用户详情页面
- ✅ 用户管理 API
- ✅ Admin 导航集成

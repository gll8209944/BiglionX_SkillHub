# Release Notes - v1.0.0

**发布日期**: 2026-04-16  
**版本类型**: Major Release 🎉

---

## 🎊 概述

我们非常激动地宣布 **SkillHub v1.0.0** 正式发布！这是一个企业级、可自托管的 AI Agent 技能管理平台，类似于"AI 时代的 npm/Docker Hub"。

经过 11 周的密集开发，SkillHub 已经具备了完整的功能体系，包括技能发布与管理、团队协作命名空间、审核系统、CLI 工具等核心功能。

---

## ✨ 主要特性

### 📦 技能管理
- ✅ 完整的 Skill CRUD 操作（创建、读取、更新、删除/归档）
- ✅ 语义化版本控制支持
- ✅ 分类和标签系统
- ✅ 技能详情页面，包含作者信息、统计数据和版本历史
- ✅ 编辑 Skill 表单，支持实时更新元数据

### 👥 命名空间系统
- ✅ 三种命名空间类型：个人 (PERSONAL)、团队 (TEAM)、全局 (GLOBAL)
- ✅ 命名空间管理页面，支持创建和查看
- ✅ 成员管理界面，支持邀请、角色分配和移除成员
- ✅ 角色权限系统：所有者 (OWNER)、管理员 (ADMIN)、成员 (MEMBER)、查看者 (VIEWER)

### 🔍 浏览与搜索
- ✅ Skills 列表页面，支持分页和筛选
- ✅ 按分类、标签、命名空间筛选
- ✅ 全文搜索功能
- ✅ 排序功能（按创建时间、下载量等）

### 🛡️ 审核系统
- ✅ 自动化审核工作流
- ✅ 审核状态机：DRAFT → PENDING_REVIEW → UNDER_REVIEW → APPROVED/REJECTED
- ✅ 审核记录 API，支持批准和拒绝操作
- ✅ 审核备注和拒绝原因记录
- ✅ 审计日志追踪

### 📤 文件上传
- ✅ 文件上传 API，支持图标、截图等
- ✅ 文件类型验证（PNG, JPEG, GIF, ZIP, JSON）
- ✅ 文件大小限制（10MB）
- ✅ 唯一文件名生成，防止冲突
- ✅ 安全的文件存储（public/uploads 目录）

### 💻 CLI 工具
- ✅ `skillhub publish` - 发布技能到 SkillHub
- ✅ `skillhub install` - 从 SkillHub 安装技能
- ✅ `skillhub search` - 搜索可用技能
- ✅ `skillhub config` - 配置 CLI（API URL、认证令牌）
- ✅ Manifest 验证器，确保技能包格式正确

### 🔐 认证与授权
- ✅ NextAuth.js 集成
- ✅ GitHub OAuth 登录
- ✅ Session 管理
- ✅ 基于角色的访问控制 (RBAC)

### 🚀 性能优化
- ✅ React Query 数据缓存和状态管理
- ✅ Next.js 图片优化（AVIF/WebP 格式）
- ✅ Gzip/Brotli 压缩启用
- ✅ MUI 组件按需加载
- ✅ API 响应标准化

### 🛠️ 开发者体验
- ✅ TypeScript 全面覆盖
- ✅ ESLint 代码规范检查
- ✅ Turbo Monorepo 构建系统
- ✅ Prisma ORM 数据库管理
- ✅ 完整的 API 文档

---

## 🏗️ 技术栈

### 前端
- **框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **UI 库**: Tailwind CSS + Lucide React Icons
- **状态管理**: TanStack Query (React Query)
- **认证**: NextAuth.js

### 后端
- **API**: Next.js API Routes
- **数据库**: PostgreSQL 16
- **ORM**: Prisma
- **缓存**: Redis (可选)

### 工具链
- **Monorepo**: Turborepo
- **包管理器**: npm
- **CI/CD**: GitHub Actions
- **容器化**: Docker & Docker Compose

---

## 📦 快速开始

### Docker 部署（推荐）

```bash
# 克隆仓库
git clone https://github.com/BigLionX/skillhub.git
cd skillhub

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的配置

# 一键启动
docker-compose up -d

# 访问应用
open http://localhost:3000
```

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## 📝 重要变更

### 数据库 Schema
- 新增 `Review` 表用于审核记录
- 新增 `NamespaceMember` 表用于成员管理
- 新增 `AuditLog` 表用于审计追踪
- `Skill` 表增加 `repositoryUrl` 字段

### API 端点
- `POST /api/reviews` - 创建审核记录
- `PUT /api/reviews/[id]` - 更新审核状态
- `POST /api/upload` - 文件上传
- `GET /api/namespaces` - 获取命名空间列表
- `POST /api/namespaces` - 创建命名空间

###  breaking Changes
- 无重大破坏性变更

---

## 🐛 已知问题

1. **评价系统**: 当前版本仅支持基础的评分功能，详细的评论功能将在 v1.1.0 中添加
2. **付费功能**: 商业化支付集成功能暂未实现，计划在未来版本中加入
3. **PluginHub**: 当前仅支持 Skills，重型模块 (Plugins) 支持将在后续版本规划

---

## 🔜 未来计划 (v1.1.0)

- [ ] 详细的评价和评论系统
- [ ] 支付集成（支付宝、微信支付）
- [ ] 收益结算引擎
- [ ] 数据分析 Dashboard
- [ ] PluginHub 支持
- [ ] 多语言国际化 (i18n)
- [ ] WebSocket 实时通知

---

## 🙏 致谢

感谢以下项目和团队的启发与支持：

- [iflytek/SkillHub](https://github.com/iflytek/skillhub) - 优秀的设计理念
- [npm](https://www.npmjs.com/) - 包管理的典范
- [Docker Hub](https://hub.docker.com/) - 容器镜像分发
- Next.js Team - 出色的全栈框架
- Prisma Team - 强大的 ORM 工具

---

## 📄 许可证

本项目采用 **Apache License 2.0** - 详见 [LICENSE](LICENSE) 文件

商业使用请联系: hello@skillhub.proclaw.cc

---

## 🔗 相关链接

- **GitHub Repository**: https://github.com/BigLionX/skillhub
- **Documentation**: https://github.com/BigLionX/skillhub/tree/main/docs
- **Issue Tracker**: https://github.com/BigLionX/skillhub/issues
- **Website**: https://skillhub.proclaw.cc

---

**Made with ❤️ by BigLionX Team**

# SkillHub 环境变量配置指南

**最后更新**: 2026-04-21  
**目的**: 澄清项目中所有 `.env` 文件的用途和关系

---

## 📋 环境变量文件总览

### 核心项目 (SkillHub)

```
SkillHub/
├── .env                          # 本地开发通用配置（可选）
├── .env.production               # 生产环境配置（Docker 部署用）⚠️ 不提交 Git
├── .env.production.example       # 生产环境配置模板 ✅ 可参考
├── .env.production.neon          # Neon 数据库专用配置 ⚠️ 不提交 Git
├── .env.vercel.example           # Vercel 部署配置示例 ✅ 参考用
│
└── apps/web/
    ├── .env.local                # Web 应用本地开发配置 ⚠️ 不提交 Git
    └── .env.example              # Web 应用配置模板 ✅ 可参考
```

### 子项目 (DeerFlow) - 独立项目

```
deer-flow/
├── .env                          # DeerFlow 本地配置
├── .env.example                  # DeerFlow 配置模板
└── frontend/
    ├── .env                      # DeerFlow 前端配置
    └── .env.example              # DeerFlow 前端配置模板
```

---

## 🎯 SkillHub 核心配置文件详解

### 1. `.env` (根目录)
**用途**: 本地开发时的通用配置  
**场景**: Docker Compose 本地开发  
**状态**: 可选，通常不需要

**包含内容**:
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
NEXTAUTH_SECRET=xxx
```

---

### 2. `.env.production` (根目录) ⭐ 重要
**用途**: Docker 生产环境部署配置  
**场景**: 使用 `docker-compose.yml` 部署到服务器  
**Git 状态**: ❌ **不提交** (已加入 .gitignore)

**如何创建**:
```bash
cp .env.production.example .env.production
# 然后编辑 .env.production，填入真实值
```

**包含内容**:
- 数据库配置 (PostgreSQL)
- NextAuth 认证配置
- GitHub OAuth 配置
- Redis 配置
- AI Embeddings 配置 (OpenAI/智谱AI/DeepSeek)
- 应用配置

---

### 3. `.env.production.example` (根目录) ✅ 推荐参考
**用途**: 生产环境配置模板和文档  
**场景**: 作为 `.env.production` 的参考  
**Git 状态**: ✅ **提交** (公开模板)

**特点**:
- 包含所有必需的环境变量
- 有详细的注释说明
- 提供多个 AI 提供商的配置示例
- 不包含真实密钥

---

### 4. `.env.production.neon` (根目录)
**用途**: 使用 Neon 云数据库时的专用配置  
**场景**: 部署到 Vercel + Neon 数据库  
**Git 状态**: ❌ **不提交** (已加入 .gitignore)

**与 `.env.production` 的区别**:
- 使用 Neon PostgreSQL 连接字符串
- 使用 Upstash Redis (Vercel 兼容)
- 其他配置相同

**如何创建**:
```bash
cp .env.production.neon .env.production
# 或者直接在 Vercel Dashboard 中设置环境变量
```

---

### 5. `.env.vercel.example` (根目录) ✅ 推荐参考
**用途**: Vercel 部署的环境变量清单  
**场景**: 在 Vercel Dashboard 中手动配置环境变量时参考  
**Git 状态**: ✅ **提交** (文档性质)

**特点**:
- 列出所有需要在 Vercel 中设置的变量
- 包含获取方式的说明
- 不是真正的 `.env` 文件，而是配置清单

---

### 6. `apps/web/.env.local` ⭐ 最常用
**用途**: Web 应用本地开发配置  
**场景**: 运行 `npm run dev` 时使用  
**Git 状态**: ❌ **不提交** (Next.js 默认忽略)

**优先级**: 最高 (会覆盖其他 .env 文件)

**如何创建**:
```bash
cd apps/web
cp .env.example .env.local
# 然后编辑 .env.local
```

**包含内容**:
```env
# 数据库
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="xxx"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (本地测试可用 mock)
GITHUB_CLIENT_ID="xxx"
GITHUB_CLIENT_SECRET="xxx"

# Redis (可选)
REDIS_URL="redis://localhost:6379"

# AI Embeddings (可选)
OPENAI_API_KEY="your-api-key"
OPENAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"  # 智谱AI
```

---

### 7. `apps/web/.env.example` ✅ 推荐参考
**用途**: Web 应用配置模板  
**场景**: 创建 `.env.local` 时参考  
**Git 状态**: ✅ **提交**

**特点**:
- 与 `.env.local` 结构相同
- 使用占位符而非真实值
- 包含详细注释

---

## 🔄 配置文件关系图

```
开发阶段 (本地)
├── apps/web/.env.local          ← 主要使用这个
│   └── 参考 apps/web/.env.example
│
└── .env (可选，Docker 开发时用)

部署阶段
├── Docker 部署
│   └── .env.production          ← 复制自 .env.production.example
│       └── 参考 .env.production.example
│
└── Vercel 部署
    ├── 在 Vercel Dashboard 设置环境变量
    │   └── 参考 .env.vercel.example 或 VERCEL_ENV_CHECKLIST.md
    │
    └── 或使用 .env.production.neon (本地测试用)
```

---

## 📝 快速开始指南

### 场景 1: 本地开发 (最常见)

```bash
# 1. 进入 web 应用目录
cd apps/web

# 2. 复制示例配置
cp .env.example .env.local

# 3. 编辑 .env.local，填入你的配置
# 至少需要设置:
# - DATABASE_URL (本地 PostgreSQL)
# - NEXTAUTH_SECRET (运行: openssl rand -base64 32)
# - GITHUB_CLIENT_ID 和 GITHUB_CLIENT_SECRET (可选，用于 GitHub 登录)

# 4. 启动开发服务器
npm run dev
```

### 场景 2: Docker 本地测试

```bash
# 1. 复制生产配置模板
cp .env.production.example .env.production

# 2. 编辑 .env.production，修改数据库密码等

# 3. 启动 Docker
docker-compose up -d
```

### 场景 3: Docker 生产部署

```bash
# 1. 在服务器上复制配置
cp .env.production.example .env.production

# 2. 编辑 .env.production，填入所有真实配置
#    - 生成强密码
#    - 设置真实的 API Keys
#    - 配置正确的域名

# 3. 启动 Docker
docker-compose -f docker-compose.yml up -d
```

### 场景 4: Vercel 部署

**方法 A: 通过 Vercel Dashboard (推荐)**

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 导入项目
3. 在 Settings → Environment Variables 中添加变量
4. 参考 `VERCEL_ENV_CHECKLIST.md` 或 `.env.vercel.example`

**方法 B: 使用 Vercel CLI**

```bash
cd apps/web
vercel env add DATABASE_URL production
vercel env add OPENAI_API_KEY production
vercel env add OPENAI_BASE_URL production
# ... 添加其他变量
```

---

## 🔑 关键环境变量说明

### 必需变量 (所有环境)

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 | 运行 `openssl rand -base64 32` 生成 |
| `NEXTAUTH_URL` | 应用 URL | `http://localhost:3000` 或 `https://yourdomain.com` |

### 可选变量

| 变量名 | 说明 | 何时需要 |
|--------|------|----------|
| `GITHUB_CLIENT_ID` | GitHub OAuth Client ID | 需要 GitHub 登录时 |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | 需要 GitHub 登录时 |
| `REDIS_URL` | Redis 连接字符串 | 需要缓存/速率限制时 |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | Vercel 部署时用 |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis Token | Vercel 部署时用 |

### AI Embeddings 变量 (语义搜索功能)

选择一个提供商配置即可：

**智谱AI (推荐)**:
```env
OPENAI_API_KEY=your-zhipu-key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**DeepSeek**:
```env
OPENAI_API_KEY=your-deepseek-key
OPENAI_BASE_URL=https://api.deepseek.com
```

**OpenAI**:
```env
OPENAI_API_KEY=your-openai-key
# OPENAI_BASE_URL 不设置或使用默认值
```

---

## ⚠️ 常见混淆和解决方案

### 问题 1: "我应该编辑哪个文件？"

**答案**:
- 本地开发 → 编辑 `apps/web/.env.local`
- Docker 部署 → 编辑 `.env.production`
- Vercel 部署 → 在 Vercel Dashboard 中设置

### 问题 2: "为什么有多个 .env.production 文件？"

**答案**:
- `.env.production` - 通用生产配置
- `.env.production.neon` - 专门用于 Neon + Vercel 的配置
- `.env.production.example` - 模板文件，不要直接使用

### 问题 3: ".env.local 和 .env 有什么区别？"

**答案**:
- `.env.local` - Next.js 专用，优先级最高，只在本地生效
- `.env` - 通用环境变量文件，会被 Git 跟踪（如果没被忽略）

**建议**: 始终使用 `.env.local` 进行本地开发

### 问题 4: "deer-flow 目录下的 .env 文件需要管吗？"

**答案**: 
不需要！`deer-flow/` 是一个独立的子项目，有自己的配置。除非你要开发 DeerFlow 集成功能，否则可以忽略它。

---

## 🛡️ 安全最佳实践

1. **永远不要提交真实的密钥到 Git**
   - ✅ `.env.example` - 可以提交（使用占位符）
   - ❌ `.env.local`, `.env.production` - 不要提交

2. **定期检查 .gitignore**
   ```bash
   git check-ignore .env* 
   # 应该显示所有敏感的 .env 文件
   ```

3. **使用不同的密钥用于不同环境**
   - 开发环境可以用测试密钥
   - 生产环境必须使用正式密钥

4. **定期轮换密钥**
   - 建议每 90 天更换一次 API Keys
   - 泄露后立即更换

---

## 📚 相关文档

- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Vercel 部署完整指南
- [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md) - Vercel 环境变量详细清单
- [.env.production.example](./.env.production.example) - 生产配置模板
- [apps/web/.env.example](./apps/web/.env.example) - Web 应用配置模板

---

## 🎯 总结

**记住这三个文件就够了**:

1. **本地开发**: `apps/web/.env.local` (复制自 `apps/web/.env.example`)
2. **Docker 部署**: `.env.production` (复制自 `.env.production.example`)
3. **Vercel 部署**: 在 Vercel Dashboard 中设置 (参考 `VERCEL_ENV_CHECKLIST.md`)

其他文件都是模板或特殊场景使用，大多数情况下不需要关心。

---

**维护者**: BigLionX Team  
**下次审查**: 2026-07-01

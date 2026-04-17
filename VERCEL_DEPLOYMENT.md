# SkillHub Vercel 部署指南

> 快速将 SkillHub 部署到 Vercel 平台

---

## 📋 前置准备

### 1. Vercel 账号

- 访问 [vercel.com](https://vercel.com)
- 使用 GitHub 账号登录（推荐）

### 2. 数据库准备

SkillHub 需要 PostgreSQL 数据库，推荐使用 [Neon](https://neon.tech) 或 [Supabase](https://supabase.com)

**获取数据库连接字符串：**

```bash
# Neon 数据库格式
postgresql://user:password@ep-xxx.region.aws.neon.tech/skillhub?sslmode=require

# Supabase 数据库格式
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### 3. GitHub OAuth 配置（可选但推荐）

1. 访问 [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写信息：
   - **Application name**: SkillHub
   - **Homepage URL**: `https://your-app.vercel.app`（部署后的 URL）
   - **Authorization callback URL**: `https://your-app.vercel.app/api/auth/callback/github`
4. 获取 Client ID 和 Client Secret

### 4. NextAuth Secret 生成

```bash
# 在本地终端运行
openssl rand -base64 32
```

---

## 🚀 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

#### 步骤 1: 导入项目

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Add New" > "Project"
3. 选择 "Import Git Repository"
4. 选择你的 SkillHub GitHub 仓库

#### 步骤 2: 配置项目

**Root Directory 设置（重要！）：**

```
apps/web
```

这是关键配置，因为 SkillHub 使用 Monorepo 结构。

#### 步骤 3: 配置环境变量

在 Vercel 的 "Environment Variables" 中添加：

```bash
# 必填项
DATABASE_URL=postgresql://user:password@db.example.com/skillhub?sslmode=require
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app.vercel.app

# 可选项
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Redis 缓存（可选）
REDIS_URL=redis://default:password@redis.example.com:6379
```

#### 步骤 4: 配置 Build Settings

**Build Command:**
```bash
cd apps/web && npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Output Directory:**
```
apps/web/.next
```

**Install Command:**
```bash
npm install
```

#### 步骤 5: 部署

点击 "Deploy" 按钮，等待部署完成。

---

### 方法二：使用 Vercel CLI

#### 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 登录 Vercel

```bash
vercel login
```

#### 部署项目

```bash
# 首次部署
vercel

# 后续部署
vercel --prod
```

#### 配置 Root Directory

在部署过程中，Vercel 会询问 Root Directory，输入：

```
apps/web
```

---

## 🔧 数据库配置

### Neon 数据库（推荐）

1. 访问 [neon.tech](https://neon.tech)
2. 创建免费项目
3. 获取连接字符串
4. 在 Vercel 环境变量中设置 `DATABASE_URL`

### Supabase 数据库

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 在 Settings > Database 中获取连接字符串
4. 在 Vercel 环境变量中设置 `DATABASE_URL`

### 数据库迁移

首次部署时，Vercel 会自动执行数据库迁移。如果遇到问题，可以手动执行：

```bash
# 本地执行迁移
cd apps/web
npx prisma migrate deploy
```

或者在 Vercel 的部署日志中检查迁移是否成功。

---

## 📊 部署后验证

### 1. 检查部署状态

访问 Vercel Dashboard 查看部署日志：

```
https://vercel.com/your-account/skillhub/deployments
```

### 2. 测试应用

访问你的应用 URL：

```
https://your-app.vercel.app
```

### 3. 验证功能

- ✅ 首页加载正常
- ✅ 注册/登录功能
- ✅ Skills 市场页面
- ✅ Dashboard 功能

### 4. 检查日志

在 Vercel Dashboard > Functions 中查看函数日志。

---

## ⚙️ 环境变量完整列表

### 必填项

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@db.com/skillhub?sslmode=require` |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 | 通过 `openssl rand -base64 32` 生成 |
| `NEXTAUTH_URL` | 应用的完整 URL | `https://your-app.vercel.app` |

### 可选项

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `GITHUB_ID` | GitHub OAuth Client ID | `your-client-id` |
| `GITHUB_SECRET` | GitHub OAuth Client Secret | `your-client-secret` |
| `REDIS_URL` | Redis 连接字符串 | `redis://default:pass@redis.com:6379` |
| `RESEND_API_KEY` | Resend 邮件服务 API Key | `re_xxx` |
| `RESEND_FROM_EMAIL` | 发件人邮箱 | `noreply@yourdomain.com` |
| `NODE_ENV` | 运行环境 | `production` |

---

## 🔄 更新部署

### 自动部署

Vercel 会在以下情况自动部署：

1. **推送代码到 main 分支**
2. **合并 Pull Request**
3. **手动触发重新部署**

### 手动部署

```bash
# 使用 Vercel CLI
vercel --prod

# 或使用 Git
git push origin main
```

### 预览部署

每次 Pull Request 都会自动生成预览 URL：

```
https://skillhub-git-branch-name.vercel.app
```

---

## 🐛 常见问题

### 1. 部署失败：找不到 package.json

**问题：** 构建失败，提示找不到 package.json

**解决：** 确保 Root Directory 设置为 `apps/web`

### 2. Prisma 客户端生成失败

**问题：** `Error: @prisma/client did not initialize yet`

**解决：** 确保 Build Command 包含 `npx prisma generate`

### 3. 数据库连接失败

**问题：** 无法连接到数据库

**解决：**
- 检查 `DATABASE_URL` 是否正确
- 确保数据库允许外部连接
- 检查数据库的 SSL 配置（必须启用 SSL）

### 4. NextAuth 回调 URL 错误

**问题：** 登录后跳转失败

**解决：**
- 检查 `NEXTAUTH_URL` 是否与部署 URL 一致
- 检查 GitHub OAuth 的回调 URL 是否正确

### 5. 内存不足错误

**问题：** 构建时内存不足

**解决：** 在 Vercel 的 Build Settings 中添加：

```bash
NODE_OPTIONS="--max-old-space-size=4096"
```

---

## 📈 优化建议

### 1. 使用 Vercel Edge Functions

对于 API 路由，可以考虑使用 Edge Functions 提高性能：

```typescript
// 在 API 路由文件中添加
export const config = {
  runtime: 'edge',
};
```

### 2. 配置自定义域名

1. 在 Vercel Dashboard 进入项目设置
2. 点击 "Domains"
3. 添加你的域名
4. 配置 DNS 记录

### 3. 启用分析

在 Vercel Dashboard 启用：

- **Analytics**: 监控应用性能
- **Speed Insights**: 分析加载速度
- **Web Vitals**: 监控核心指标

### 4. 配置环境变量分支

为不同环境配置不同的变量：

- `production`: 生产环境
- `preview`: 预览环境
- `development`: 开发环境

---

## 🔒 安全建议

### 1. 环境变量安全

- ✅ 不要在代码中硬编码密钥
- ✅ 使用 Vercel 的环境变量管理
- ✅ 定期轮换密钥
- ❌ 不要提交 `.env` 文件到 Git

### 2. 数据库安全

- ✅ 使用强密码
- ✅ 启用 SSL 连接
- ✅ 限制数据库 IP 白名单
- ✅ 定期备份数据库

### 3. GitHub OAuth

- ✅ 定期轮换 Client Secret
- ✅ 限制回调 URL
- ✅ 使用最小权限范围

---

## 📞 支持与帮助

### 官方文档

- [Vercel Next.js 部署指南](https://vercel.com/docs/frameworks/nextjs)
- [Vercel 环境变量文档](https://vercel.com/docs/projects/environment-variables)
- [Prisma Vercel 部署指南](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

### 社区支持

- [Vercel Discord](https://vercel.community)
- [GitHub Issues](https://github.com/BigLionX/SkillHub/issues)

---

##  检查清单

部署前确认：

- [ ] Vercel 账号已创建
- [ ] GitHub 仓库已推送
- [ ] 数据库已创建并配置
- [ ] 数据库连接字符串已获取
- [ ] NextAuth Secret 已生成
- [ ] GitHub OAuth 已配置（如使用）
- [ ] Root Directory 设置为 `apps/web`
- [ ] Build Command 配置正确
- [ ] 所有必需的环境变量已添加
- [ ] .env 文件未提交到 Git
- [ ] 本地测试通过

部署后确认：

- [ ] 部署成功，无错误
- [ ] 应用可正常访问
- [ ] 数据库连接正常
- [ ] 登录功能正常
- [ ] Skills 市场页面正常
- [ ] Dashboard 功能正常
- [ ] 环境变量配置正确

---

**文档版本**: v1.0  
**最后更新**: 2026-04-17  
**状态**: ✅ 已完成

---

_SkillHub Vercel 部署指南，助你快速上线！_ 🚀

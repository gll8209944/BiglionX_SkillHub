# SkillHub Vercel 部署指南

## 📋 概述

本指南介绍如何将 SkillHub 部署到 Vercel，使用云服务替代本地基础设施。

### 架构对比

**原架构（Docker）：**
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Web App  │───►│PostgreSQL│    │  Redis   │
│ (Docker) │    │ (Local)  │    │ (Local)  │
└──────────┘    └──────────┘    └──────────┘
```

**Vercel 架构：**
```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Web App  │───►│  Neon    │    │ Upstash  │
│ (Vercel) │    │ (Cloud)  │    │ (Cloud)  │
└──────────┘    └──────────┘    └──────────┘
     │
     └──► Vercel Edge Network (Global CDN)
```

---

## 🚀 快速开始

### 前置条件

1. ✅ **Neon 数据库** - 已配置（`NEON_DATABASE_URL`）
2. ⚠️ **Upstash Redis** - 需要注册（免费层可用）
3. ✅ **GitHub 仓库** - 代码已推送
4. ✅ **Vercel 账号** - 需要注册

---

## 📝 步骤 1：设置 Upstash Redis

### 1.1 注册 Upstash

访问 [https://upstash.com](https://upstash.com) 并注册账号。

### 1.2 创建 Redis 数据库

1. 点击 "Create Database"
2. 选择区域：**Singapore**（与 Neon 相同区域，降低延迟）
3. 选择套餐：**Free**（10,000 命令/天，足够开发使用）
4. 点击 "Create"

### 1.3 获取连接信息

在 Upstash Dashboard 中：
1. 进入数据库详情页
2. 点击 "REST API" 标签
3. 复制以下信息：
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 📝 步骤 2：配置 Vercel 环境变量

### 2.1 登录 Vercel

访问 [https://vercel.com](https://vercel.com) 并登录。

### 2.2 导入项目

1. 点击 "Add New Project"
2. 选择 "Import Git Repository"
3. 选择你的 GitHub 仓库：`BiglionX/SkillHub`
4. 点击 "Import"

### 2.3 配置项目设置

**Root Directory:** `apps/web`

**Build Command:** 
```bash
cd ../.. && npm run build
```

**Install Command:**
```bash
cd ../.. && npm ci
```

### 2.4 添加环境变量

在 Vercel 项目设置中，添加以下环境变量：

#### 必需变量

```env
# 数据库
DATABASE_URL=postgresql://neondb_owner:npg_bk4AgQRL3WYd@ep-aged-dew-a17sn40r.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Redis (Upstash)
REDIS_URL=redis://default:YOUR_UPSTASH_PASSWORD@YOUR_UPSTASH_HOST:6379
UPSTASH_REDIS_REST_URL=https://YOUR_DATABASE.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR_UPSTASH_TOKEN

# NextAuth
NEXTAUTH_SECRET=hhfZEJiShGON9crLDjmmnBx4bV6wH0RrqT15p4gSYRc=
NEXTAUTH_URL=https://your-project.vercel.app

# Node 环境
NODE_ENV=production
```

#### 可选变量（API Keys）

```env
OPENAI_API_KEY=sk-...
ZHIPU_API_KEY=...
GITHUB_TOKEN=ghp_...
SKILLSMP_API_KEY=sk_live_...
```

---

## 📝 步骤 3：修改 Redis 连接代码

Vercel Serverless Functions 需要使用 HTTP 协议连接 Redis（Upstash）。

### 3.1 安装 Upstash Redis 客户端

```bash
cd apps/web
npm install @upstash/redis
```

### 3.2 更新 Redis 配置

创建或修改 `apps/web/lib/redis.ts`：

```typescript
import { Redis } from '@upstash/redis';

// 检测是否在 Vercel 环境
const isVercel = process.env.VERCEL === '1';

let redisCache: any;

if (isVercel) {
  // Vercel 环境：使用 Upstash HTTP API
  redisCache = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
} else {
  // 本地环境：使用传统 Redis
  const { createClient } = require('redis');
  const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });
  
  client.on('error', (err: any) => console.error('Redis Client Error:', err));
  client.connect().catch(console.error);
  
  redisCache = client;
}

export { redisCache };
```

---

## 📝 步骤 4：运行数据库迁移

在部署前，需要在本地运行 Prisma 迁移到 Neon 数据库：

```bash
cd apps/web

# 设置环境变量
$env:DATABASE_URL = "你的NEON_DATABASE_URL"

# 运行迁移
npx prisma migrate deploy
npx prisma generate
```

---

## 📝 步骤 5：部署到 Vercel

### 方法 1：通过 Vercel Dashboard（推荐）

1. 在 Vercel Dashboard 中点击 "Deploy"
2. 等待构建完成（约 3-5 分钟）
3. 部署成功后，Vercel 会提供一个域名：`your-project.vercel.app`

### 方法 2：通过 CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd apps/web
vercel --prod
```

---

## 🔧 配置自定义域名（可选）

### 1. 在 Vercel 中添加域名

1. 进入项目设置 → "Domains"
2. 输入你的域名（如 `skillhub.yourdomain.com`）
3. 点击 "Add"

### 2. 配置 DNS

根据你的域名提供商，添加以下记录：

**CNAME 记录：**
```
名称: skillhub
类型: CNAME
值: cname.vercel-dns.com
```

### 3. 更新 NEXTAUTH_URL

在 Vercel 环境变量中更新：
```env
NEXTAUTH_URL=https://skillhub.yourdomain.com
```

---

## 📊 成本估算

### Vercel Hobby（免费）
- ✅ 无限个人项目
- ✅ 100 GB 带宽/月
- ✅ 自动 HTTPS
- ⚠️ Serverless Function 执行时间限制：10 秒

### Vercel Pro（$20/月）
- ✅ 1 TB 带宽/月
- ✅ Serverless Function 执行时间：60 秒
- ✅ 分析功能
- ✅ 优先支持

### Upstash Redis Free
- ✅ 10,000 命令/天
- ✅ 256 MB 存储
- ✅ 全球分布

### Neon Free
- ✅ 0.5 GB 存储
- ✅ 0.25 vCPU
- ✅ 1 GB 带宽/月

**总计：$0-20/月**（取决于流量）

---

## ⚠️ 注意事项

### 1. Serverless 冷启动

Vercel Serverless Functions 有冷启动问题：
- 首次请求可能需要 2-5 秒
- 后续请求会很快

**解决方案：**
- 使用 Vercel Cron Jobs 定期唤醒函数
- 优化代码减少初始化时间

### 2. 执行时间限制

- **Hobby**: 10 秒
- **Pro**: 60 秒

如果你的 API 需要更长时间，考虑：
- 优化查询性能
- 使用后台任务（Vercel Cron）
- 升级到 Pro 计划

### 3. 数据库连接池

Prisma 在 Serverless 环境中需要特殊配置：

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 4. 文件上传

Vercel Serverless 不支持持久文件系统。如果需要文件上传：
- 使用云存储（AWS S3、Cloudflare R2）
- 或使用 Base64 编码存储到数据库

---

## 🛠️ 常用命令

### 本地预览生产构建

```bash
cd apps/web
npm run build
npm start
```

### 查看 Vercel 日志

```bash
vercel logs your-project.vercel.app
```

### 回滚部署

```bash
vercel rollback
```

---

## ❓ 常见问题

### Q: Vercel 能替代 Docker 部署吗？

A: 对于前端和 API 可以，但需要配合云服务：
- 数据库 → Neon/Railway/Supabase
- Redis → Upstash/Redis Cloud
- 文件存储 → AWS S3/Cloudflare R2

### Q: 性能会比 Docker 部署差吗？

A: 
- **静态页面**: Vercel 更快（CDN 加速）
- **API 请求**: 差不多（取决于数据库延迟）
- **冷启动**: Vercel 稍慢（首次请求 2-5 秒）

### Q: 如何监控 Vercel 应用？

A: 
- Vercel Dashboard 提供基本监控
- 集成 Sentry 进行错误追踪
- 使用 Vercel Analytics 分析流量

### Q: 可以继续使用 Docker 镜像吗？

A: 不可以。Vercel 有自己的构建系统，不使用 Docker。

---

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Next.js on Vercel](https://nextjs.org/docs/deployment)
- [Upstash Redis 文档](https://upstash.com/docs/redis)
- [Neon + Vercel 集成](https://neon.tech/docs/guides/vercel)
- [Prisma Serverless 指南](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management/configure-pg-bouncer)

---

## 🆘 获取帮助

遇到问题？
1. 查看 Vercel 构建日志
2. 检查环境变量配置
3. 查阅 [GitHub Issues](https://github.com/BiglionX/SkillHub/issues)
4. 联系 Vercel 支持

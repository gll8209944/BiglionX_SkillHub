# SkillHub Vercel 部署指南

## 📋 部署前检查清单

### ✅ 代码已推送
- [x] TypeScript 类型错误已修复
- [x] ESLint 警告已处理
- [x] 敏感信息已从 Git 中排除（.env.production.neon）

### 🔑 Vercel 环境变量配置

在 Vercel Dashboard 中设置以下环境变量（Settings → Environment Variables）：

#### 1. 数据库配置（Neon PostgreSQL）
```env
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

#### 2. Redis 配置（Upstash）
```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

#### 2.5. AI Embeddings 配置（语义搜索，可选）

**推荐使用智谱AI**（性价比高，国内访问快）：

```env
OPENAI_API_KEY=你的智谱AI API Key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**获取智谱AI API Key**:
1. 访问 [智谱AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 进入 [API Keys 管理](https://open.bigmodel.cn/usercenter/apikeys)
4. 创建新的 API Key
5. 复制并粘贴到 `OPENAI_API_KEY`

**其他选项**:
- DeepSeek: `OPENAI_BASE_URL=https://api.deepseek.com`
- OpenAI: 不设置 `OPENAI_BASE_URL`（使用默认值）

#### 3. NextAuth 认证配置
```env
NEXTAUTH_SECRET=<生成方法: openssl rand -base64 32>
NEXTAUTH_URL=https://skillhub.proclaw.cc
```

#### 4. GitHub OAuth 配置
```env
GITHUB_CLIENT_ID=<你的生产环境 GitHub Client ID>
GITHUB_CLIENT_SECRET=<你的生产环境 GitHub Client Secret>
```

**GitHub OAuth 回调 URL**: `https://skillhub.proclaw.cc/api/auth/callback/github`

#### 5. 应用配置
```env
NODE_ENV=production
VERCEL=1
```

### 🌐 域名配置

1. 在 Vercel Dashboard → Settings → Domains 添加域名
2. 配置 DNS 记录指向 Vercel
3. 启用 HTTPS（Vercel 自动处理）

### 🚀 部署步骤

#### 方法一：通过 Vercel Dashboard（推荐）

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入 GitHub 仓库 `BiglionX/SkillHub`
4. 配置构建设置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. 添加所有环境变量
6. 点击 "Deploy"

#### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 进入 web 应用目录
cd apps/web

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### ⚙️ Vercel 项目配置

在项目根目录创建或更新 `vercel.json`：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 🔍 部署后验证

1. **健康检查**
   ```bash
   curl https://skillhub.proclaw.cc/api/health
   ```
   
   期望响应：
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-04-20T...",
     "uptime": 123.456,
     "version": "1.0.0",
     "checks": {
       "database": {
         "status": "healthy",
         "responseTime": 50,
         "error": null
       },
       "redis": {
         "status": "healthy",
         "responseTime": 30,
         "error": null
       },
       "totalResponseTime": 85
     }
   }
   ```

2. **功能测试**
   - [ ] 用户注册/登录
   - [ ] GitHub OAuth 登录
   - [ ] Skills 浏览和搜索
   - [ ] API 端点正常工作

3. **性能检查**
   - 访问 Vercel Analytics 查看性能指标
   - 检查 Core Web Vitals

### 🛠️ 常见问题

#### Q1: 构建失败 - Redis 模块找不到
**解决方案**: 确保在 Vercel 环境变量中设置了 `UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN`

#### Q2: 数据库连接失败
**解决方案**: 
- 检查 `DATABASE_URL` 是否正确
- 确认 Neon 数据库允许来自 Vercel 的连接
- 检查 SSL 模式是否设置为 `require`

#### Q3: NextAuth 回调 URL 不匹配
**解决方案**: 
- 确保 `NEXTAUTH_URL` 设置为正确的生产域名
- 在 GitHub OAuth App 中更新回调 URL

#### Q4: 静态资源 404
**解决方案**: 
- 检查 `next.config.js` 中的资产配置
- 确保所有静态文件在 `public/` 目录中

### 📊 监控和维护

1. **日志查看**
   - Vercel Dashboard → Deployments → 点击部署 → Logs
   
2. **性能监控**
   - 启用 Vercel Analytics
   - 考虑集成 Sentry 进行错误追踪

3. **定期维护**
   - 轮换敏感凭证（每月）
   - 检查依赖更新
   - 审查访问日志

### 🔒 安全建议

1. ✅ 不要在代码中硬编码密钥
2. ✅ 使用强密码和随机生成的密钥
3. ✅ 定期轮换环境变量
4. ✅ 限制数据库访问权限
5. ✅ 启用双因素认证（GitHub 和 Vercel）
6. ✅ 审查 CORS 配置，仅允许可信域名

### 📝 部署后更新

当代码更新后：

```bash
# 提交并推送更改
git add .
git commit -m "描述更改"
git push origin master

# Vercel 会自动触发新的部署
# 或者手动触发
vercel --prod
```

---

**部署状态**: 准备就绪 ✅  
**最后更新**: 2026-04-20

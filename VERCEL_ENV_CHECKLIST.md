# Vercel 部署环境变量清单

## ⚠️ 重要提示
**不要将此文件提交到 Git！** 此文件仅作为参考，实际值应在 Vercel Dashboard 中设置。

---

## 📋 必需的环境变量

### 1️⃣ 数据库配置（Neon PostgreSQL）

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_xxx@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` | Neon 数据库连接字符串 |

**获取方式**: 
- 登录 [Neon Console](https://console.neon.tech)
- 选择你的项目
- 复制 Connection String（确保包含密码）

---

### 2️⃣ Redis 配置（Upstash）

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `UPSTASH_REDIS_REST_URL` | `https://assured-crow-74053.upstash.io` | Upstash Redis REST API URL |
| `UPSTASH_REDIS_REST_TOKEN` | `gQAAAAAAASFFAAIncDI1NWQ5NTVkMTE3ODQ0ZDkzODRhODBjMGViNmRkN2UwMnAyNzQwNTM` | Upstash Redis 访问令牌 |

**获取方式**:
- 登录 [Upstash Console](https://console.upstash.com)
- 选择你的 Redis 数据库
- 复制 REST URL 和 Token

---

### 2.5️⃣ AI Embeddings 配置（语义搜索）

支持多个 AI 提供商，选择一个配置即可：

#### 选项 A: 智谱AI (推荐，性价比高) 🇨🇳

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `OPENAI_API_KEY` | `e0561298533a4d2f8d4b79d00c4c950b.xxx` | 智谱AI API Key |
| `OPENAI_BASE_URL` | `https://open.bigmodel.cn/api/paas/v4` | 智谱AI API 端点 |

**获取方式**:
1. 访问 [智谱AI 开放平台](https://open.bigmodel.cn/)
2. 注册/登录账号
3. 进入 [API Keys 管理](https://open.bigmodel.cn/usercenter/apikeys)
4. 创建新的 API Key
5. 复制 API Key 到 `OPENAI_API_KEY`

**优点**:
- ✅ 国内访问速度快
- ✅ 价格实惠（embedding-2 模型）
- ✅ 支持中文效果好
- ✅ 1024 维向量，质量高

---

#### 选项 B: DeepSeek

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `OPENAI_API_KEY` | `sk-xxx` | DeepSeek API Key |
| `OPENAI_BASE_URL` | `https://api.deepseek.com` | DeepSeek API 端点 |

**获取方式**:
- 访问 [DeepSeek 平台](https://platform.deepseek.com/)
- 创建 API Key

---

#### 选项 C: OpenAI

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `OPENAI_API_KEY` | `sk-proj-xxx` | OpenAI API Key |
| `OPENAI_BASE_URL` | 不设置或 `https://api.openai.com/v1` | OpenAI API 端点（可选） |

**获取方式**:
- 访问 [OpenAI Platform](https://platform.openai.com/)
- 创建 API Key

**注意**: OpenAI 在国内访问可能需要代理

---

### 3️⃣ NextAuth 认证配置

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `NEXTAUTH_SECRET` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=` | 随机生成的密钥（至少 32 字节） |
| `NEXTAUTH_URL` | `https://skillhub.proclaw.cc` | 生产环境的完整 URL |

**生成 NEXTAUTH_SECRET**:
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

### 4️⃣ GitHub OAuth 配置

| 变量名 | 示例值 | 说明 |
|--------|--------|------|
| `GITHUB_CLIENT_ID` | `Ov23lixxxxxxxxxxxx` | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | GitHub OAuth App Client Secret |

**获取方式**:
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App 或使用现有的
3. **Homepage URL**: `https://skillhub.proclaw.cc`
4. **Authorization callback URL**: `https://skillhub.proclaw.cc/api/auth/callback/github`
5. 复制 Client ID 和 Client Secret

---

### 5️⃣ 应用配置

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NODE_ENV` | `production` | 环境标识 |
| `VERCEL` | `1` | Vercel 环境标识（自动设置） |

---

## 🔧 在 Vercel 中设置环境变量

### 方法一：Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 点击 **Add New**
5. 依次添加上述所有变量
6. 选择环境：**Production**, **Preview**, **Development**（建议全部勾选）
7. 点击 **Save**

### 方法二：Vercel CLI

```bash
# 登录 Vercel
vercel login

# 添加环境变量
vercel env add DATABASE_URL production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add GITHUB_CLIENT_ID production
vercel env add GITHUB_CLIENT_SECRET production
vercel env add NODE_ENV production
```

---

## ✅ 验证配置

部署后，访问健康检查端点验证所有服务正常：

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

---

## 🔒 安全最佳实践

1. ✅ **定期轮换密钥**（建议每 90 天）
2. ✅ **使用强密码**（至少 16 个字符，包含大小写、数字、特殊字符）
3. ✅ **不要在代码中硬编码密钥**
4. ✅ **限制环境变量访问权限**（仅授权人员）
5. ✅ **启用双因素认证**（GitHub 和 Vercel）
6. ✅ **审查日志**，监控异常访问

---

## 📝 更新环境变量

如果需要更新环境变量：

1. 在 Vercel Dashboard 中修改
2. **重新部署**以使更改生效：
   ```bash
   vercel --prod
   ```
   或在 Dashboard 中点击 "Redeploy"

---

**最后更新**: 2026-04-20  
**状态**: 准备就绪 ✅

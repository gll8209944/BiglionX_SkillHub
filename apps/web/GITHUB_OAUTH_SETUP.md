# GitHub OAuth 配置指南

## 📋 前置要求

1. **GitHub 账户**: 需要有一个 GitHub 账户
2. **本地开发环境**: Skill Hub Web 应用正在运行

---

## 🔧 配置步骤

### Step 1: 创建 GitHub OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 **"New OAuth App"** 按钮
3. 填写应用信息：

   ```
   Application name: Skill Hub (Development)
   Homepage URL: http://localhost:3000
   Application description: AI Agent Skill Registry - Development Environment
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

4. 点击 **"Register application"**

### Step 2: 获取 Client ID 和 Secret

注册成功后，你会看到：
- **Client ID**: 一串字符（例如：`Ov23liXXXXXXXXXXXX`）
- **Client Secret**: 需要点击 "Generate a new client secret" 生成

**重要**: 
- Client Secret 只会显示一次，请妥善保存
- 如果丢失，可以重新生成

### Step 3: 配置环境变量

编辑 `apps/web/.env.local`：

```bash
# GitHub OAuth
GITHUB_CLIENT_ID="Ov23liXXXXXXXXXXXX"
GITHUB_CLIENT_SECRET="your-client-secret-here"
```

### Step 4: 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

### Step 5: 测试登录

1. 访问 http://localhost:3000/login
2. 点击 "使用 GitHub 登录"
3. 授权应用
4. 应该会被重定向到 Dashboard

---

## 🌐 生产环境配置

当你准备部署到生产环境时：

### Step 1: 创建生产 OAuth App

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 **"New OAuth App"**
3. 填写生产环境信息：

   ```
   Application name: Skill Hub
   Homepage URL: https://skillhub.proclaw.cc
   Application description: AI Agent Skill Registry
   Authorization callback URL: https://skillhub.proclaw.cc/api/auth/callback/github
   ```

### Step 2: 更新生产环境变量

```bash
# 生产环境
GITHUB_CLIENT_ID="your-production-client-id"
GITHUB_CLIENT_SECRET="your-production-client-secret"
NEXTAUTH_URL="https://skillhub.proclaw.cc"
```

---

## ⚠️ 常见问题

### 1. Callback URL 不匹配

**错误**: `redirect_uri_mismatch`

**解决**: 
- 确保 GitHub OAuth App 中的 callback URL 完全匹配
- 包括协议（http/https）、域名、端口
- 开发环境: `http://localhost:3000/api/auth/callback/github`
- 生产环境: `https://skillhub.proclaw.cc/api/auth/callback/github`

### 2. Client Secret 无效

**错误**: `invalid_client`

**解决**:
- 检查 `.env.local` 中的值是否正确
- 确保没有多余的空格或引号
- 尝试重新生成 Client Secret

### 3. 登录后重定向失败

**解决**:
- 检查 `NEXTAUTH_URL` 是否正确设置
- 确保 middleware.ts 配置正确
- 查看浏览器控制台是否有错误

### 4. Session 不包含用户 ID

**解决**:
- 检查 `app/api/auth/[...nextauth]/route.ts` 中的 session callback
- 确保已安装 `@auth/prisma-adapter`

---

## 🔒 安全最佳实践

### 1. 保护 Client Secret

- ❌ **不要**将 `.env.local` 提交到 Git
- ✅ 使用 `.gitignore` 忽略环境变量文件
- ✅ 在生产环境使用安全的密钥管理服务

### 2. 使用 HTTPS

- 生产环境必须使用 HTTPS
- NextAuth 在某些功能上要求 HTTPS

### 3. 限制权限

- GitHub OAuth 只请求必要的权限
- 默认只需要读取用户公开信息

### 4. 定期轮换密钥

- 定期更新 Client Secret
- 如果发现泄露，立即重新生成

---

## 📊 OAuth 流程说明

```
1. 用户点击 "使用 GitHub 登录"
         ↓
2. 重定向到 GitHub 授权页面
         ↓
3. 用户授权应用
         ↓
4. GitHub 返回授权码到 callback URL
         ↓
5. NextAuth 用授权码换取 access token
         ↓
6. 获取用户信息并创建/更新数据库记录
         ↓
7. 创建 session 并重定向到 Dashboard
```

---

## 🔗 有用链接

- **NextAuth 文档**: https://next-auth.js.org
- **GitHub OAuth 文档**: https://docs.github.com/en/developers/apps/building-oauth-apps
- **Prisma Adapter**: https://next-auth.js.org/adapters/prisma
- **GitHub Developer Settings**: https://github.com/settings/developers

---

## 🎯 下一步

配置完成后，你可以：

1. ✅ 测试登录功能
2. ✅ 查看数据库中创建的用户记录
3. ✅ 实现用户个人资料页面
4. ✅ 添加更多 OAuth 提供商（Google, GitLab 等）

---

**最后更新**: 2026-04-16  
**NextAuth 版本**: 5.x (beta)  
**适配器**: @auth/prisma-adapter

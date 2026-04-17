# GitHub OAuth 登录配置指南

## 📋 配置步骤

### 步骤 1：创建 GitHub OAuth Application

1. 登录 GitHub 账号
2. 访问：**https://github.com/settings/developers**
3. 点击 **"OAuth Apps"** 标签页
4. 点击 **"New OAuth App"** 按钮

### 步骤 2：填写应用信息

```
Application name: Skill Hub (Development)
Homepage URL: http://localhost:3000
Application description: AI Agent 技能注册中心（开发环境）
Authorization callback URL: http://localhost:3000/api/auth/callback/github
```

**⚠️ 重要提示**：
- **Authorization callback URL** 必须完全匹配，包括路径
- 开发环境使用：`http://localhost:3000/api/auth/callback/github`
- 生产环境需要创建新的 OAuth App，callback URL 改为：`https://yourdomain.com/api/auth/callback/github`

### 步骤 3：获取凭证

1. 创建成功后，你会看到 **Client ID**（格式：`Iv1.xxxxxxxxxxxx`）
2. 点击 **"Generate a new client secret"** 生成密钥
3. **立即复制 Client Secret**（只显示一次！）
   - 如果忘记，可以重新生成，但旧密钥会失效

### 步骤 4：配置环境变量

打开 `apps/web/.env.local`，填入你的凭证：

```env
# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxx          # 替换为你的 Client ID
GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # 替换为你的 Client Secret
```

### 步骤 5：重启开发服务器

```bash
# 如果服务器正在运行，先停止（Ctrl+C）
# 然后重新启动
cd apps/web
npm run dev
```

### 步骤 6：测试 GitHub 登录

1. 访问：http://localhost:3000/login
2. 点击 **"使用 GitHub 登录"** 按钮
3. 会跳转到 GitHub 授权页面
4. 点击 **"Authorize"** 授权
5. 自动跳转回应用并登录

---

## 🎨 自定义应用图标（可选）

在 GitHub OAuth App 设置页面，你可以上传应用图标：

1. 访问：https://github.com/settings/developers
2. 选择你的应用
3. 上传一个 512x512 的 PNG 图片作为图标
4. 保存设置

---

## 🚀 生产环境配置

当项目部署到生产环境时：

### 1. 创建生产环境的 OAuth App

```
Application name: Skill Hub
Homepage URL: https://yourdomain.com
Authorization callback URL: https://yourdomain.com/api/auth/callback/github
```

### 2. 更新生产环境变量

```env
# 生产环境
NEXTAUTH_URL=https://yourdomain.com
GITHUB_CLIENT_ID=生产环境的Client_ID
GITHUB_CLIENT_SECRET=生产环境的Client_Secret
```

### 3. 建议：使用不同的应用

- **开发环境**：`Skill Hub (Development)` - callback 指向 localhost
- **生产环境**：`Skill Hub` - callback 指向生产域名

这样可以独立管理开发和生产环境的权限。

---

## 🔍 常见问题

### 1. 报错 "redirect_uri_mismatch"

**原因**：callback URL 不匹配

**解决方法**：
- 检查 GitHub OAuth App 中的 "Authorization callback URL"
- 必须完全匹配：`http://localhost:3000/api/auth/callback/github`
- 注意大小写和末尾斜杠

### 2. 报错 "Invalid client_id" 或 "Invalid client_secret"

**原因**：环境变量未正确配置

**解决方法**：
- 检查 `.env.local` 文件是否存在
- 确认 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 是否正确
- 重启开发服务器（修改环境变量后必须重启）

### 3. 登录后没有跳转回网站

**原因**：用户取消了授权或配置错误

**解决方法**：
- 检查浏览器控制台是否有错误
- 确认 callback URL 配置正确
- 尝试清除浏览器缓存

### 4. 想要删除已授权的应用

**解决方法**：
1. 访问：https://github.com/settings/applications
2. 找到 "Skill Hub" 应用
3. 点击 "Revoke" 撤销授权

---

## 📚 技术实现

当前配置使用了：
- **NextAuth.js v5** (beta)
- **GitHub OAuth Provider**
- **Prisma Adapter**（自动创建/更新用户记录）

登录流程：
1. 用户点击 "使用 GitHub 登录"
2. 跳转到 GitHub 授权页面
3. 用户授权后，GitHub 回调到 `/api/auth/callback/github`
4. NextAuth 处理回调，通过 Prisma 创建或更新用户
5. 自动登录并跳转到 Dashboard

---

## 🔐 安全建议

1. **永远不要**将 `.env.local` 提交到 Git
2. 定期轮换 Client Secret
3. 生产环境使用 HTTPS
4. 监控异常登录行为
5. 在 GitHub OAuth App 中启用 "Require Proof Key for Code Exchange (PKCE)"（可选但推荐）

---

## 📖 更多资源

- GitHub OAuth 文档：https://docs.github.com/en/apps/oauth-apps
- NextAuth GitHub Provider：https://next-auth.js.org/providers/github
- Prisma Adapter：https://next-auth.js.org/adapters/prisma

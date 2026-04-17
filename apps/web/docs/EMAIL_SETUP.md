# 邮箱登录配置指南

Skill Hub 支持通过邮箱验证码登录，需要配置 SMTP 邮件服务器。以下是常用邮箱服务的配置方法。

## 快速开始

### 1. 选择邮件服务

你可以选择以下任一方式：

- **Resend**（推荐）- 专业的邮件发送服务，免费额度充足
- **QQ 邮箱** - 适合国内用户
- **Gmail** - 适合国际用户
- **163 邮箱** - 网易邮箱

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

然后根据你选择的邮件服务，填入相应的配置。

---

## 方案一：使用 Resend（推荐）

Resend 是现代化的邮件发送服务，提供免费额度（每月 3000 封邮件）。

### 步骤：

1. 注册账号：https://resend.com
2. 创建 API Key
3. 验证域名（可选，但推荐）
4. 在 `.env.local` 中配置：

```env
RESEND_API_KEY="re_xxx"
EMAIL_FROM="noreply@yourdomain.com"
```

> 注意：使用 Resend 时，不需要配置 `EMAIL_SERVER_*` 变量

---

## 方案二：使用 QQ 邮箱

### 步骤：

1. 登录 QQ 邮箱网页版
2. 进入 **设置** → **账户**
3. 找到 **POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务**
4. 开启 **IMAP/SMTP服务**
5. 点击 **生成授权码**，按提示操作
6. 复制生成的授权码

在 `.env.local` 中配置：

```env
EMAIL_SERVER_HOST="smtp.qq.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="your-email@qq.com"
EMAIL_SERVER_PASSWORD="your-authorization-code"  # 使用授权码，不是登录密码
EMAIL_FROM="your-email@qq.com"
```

---

## 方案三：使用 Gmail

### 步骤：

1. 启用两步验证：https://myaccount.google.com/security
2. 生成应用专用密码：https://myaccount.google.com/apppasswords
3. 选择应用为 "邮件"，设备为 "其他"
4. 复制生成的 16 位密码

在 `.env.local` 中配置：

```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="xxxx xxxx xxxx xxxx"  # 16位应用专用密码
EMAIL_FROM="your-email@gmail.com"
```

---

## 方案四：使用 163 邮箱

### 步骤：

1. 登录 163 邮箱网页版
2. 进入 **设置** → **POP3/SMTP/IMAP**
3. 开启 **IMAP/SMTP服务**
4. 点击 **客户端授权密码**，设置授权密码

在 `.env.local` 中配置：

```env
EMAIL_SERVER_HOST="smtp.163.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="your-email@163.com"
EMAIL_SERVER_PASSWORD="your-authorization-code"
EMAIL_FROM="your-email@163.com"
```

---

## 测试配置

配置完成后，重启开发服务器：

```bash
npm run dev
```

访问 http://localhost:3000/login，输入邮箱地址进行测试。

### 预期流程：

1. 输入邮箱地址
2. 点击 "发送验证邮件"
3. 系统发送邮件并跳转到 `/login/verify` 页面
4. 检查邮箱收件箱（包括垃圾邮件文件夹）
5. 点击邮件中的验证链接
6. 自动登录并跳转到 Dashboard

---

## 常见问题

### 1. 收不到验证邮件

- 检查垃圾邮件文件夹
- 确认邮箱地址正确
- 检查 SMTP 配置是否正确
- 查看控制台是否有错误信息
- 确认邮箱服务商的 SMTP 服务已开启

### 2. 报错 "Invalid login"

- QQ/163 邮箱：确认使用的是**授权码**，不是登录密码
- Gmail：确认使用的是**应用专用密码**
- 检查用户名和密码是否正确

### 3. 报错 "Connection timeout"

- 检查网络连接
- 确认防火墙未阻止 SMTP 端口（465 或 587）
- 尝试切换端口（465 使用 SSL，587 使用 TLS）

### 4. 本地开发测试

如果不想配置真实邮箱，可以使用：

- **Mailtrap** - https://mailtrap.io（虚拟 SMTP 测试服务）
- **Ethereal** - https://ethereal.email（NextAuth 内置支持）

---

## 安全建议

1. **永远不要**将 `.env.local` 提交到 Git
2. 生产环境使用专业的邮件服务（如 Resend、SendGrid）
3. 定期轮换 SMTP 密码/授权码
4. 监控邮件发送失败率

---

## 更多信息

- NextAuth Nodemailer Provider: https://next-auth.js.org/providers/nodemailer
- Resend 文档: https://resend.com/docs
- Nodemailer 文档: https://nodemailer.com/

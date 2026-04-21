# 密码登录功能使用指南

## ✅ 已完成的功能

### 1. 邮件服务集成 ✓

已成功集成 Resend 邮件服务到忘记密码功能：

- **自动发送邮件**：当用户请求重置密码时，系统会自动发送包含重置链接的邮件
- **精美的 HTML 邮件模板**：包含品牌标识、清晰的 CTA 按钮和安全提示
- **安全设计**：即使邮件发送失败，也返回成功消息（防止枚举攻击）
- **令牌过期**：重置链接 1 小时后自动失效

**环境变量配置**（已在 `.env.local` 中配置）：
```env
RESEND_API_KEY=re_hFCVSaYd_4JGxJiwtUVb6yjqWZd7T6PEH
EMAIL_FROM=onboarding@resend.dev
```

### 2. 数据库更新 ✓

已成功更新数据库 Schema：
- 添加了 `resetToken` 字段（存储重置令牌）
- 添加了 `resetTokenExpiry` 字段（存储令牌过期时间）
- 已推送到 Neon PostgreSQL 数据库

### 3. Prisma 客户端状态 ⚠️

由于开发服务器正在运行，Prisma 客户端暂时无法自动更新。

## 🔄 需要执行的操作

### 重启开发服务器以更新 Prisma 客户端

请按以下步骤操作：

#### Windows PowerShell:
```powershell
# 1. 停止当前运行的开发服务器（按 Ctrl+C）

# 2. 重新生成 Prisma 客户端
npx prisma generate

# 3. 重新启动开发服务器
npm run dev
```

#### 或者使用一键命令：
```powershell
# 停止所有 Node 进程（谨慎使用）
Get-Process node | Stop-Process -Force

# 然后重新启动
npm run dev
```

## 🧪 测试流程

### 测试账户
- **邮箱**: test@example.com
- **密码**: Test123456

### 完整测试步骤

#### 1. 测试密码登录
1. 访问 http://localhost:3000/login
2. 选择"密码登录"选项卡
3. 输入：
   - 邮箱: test@example.com
   - 密码: Test123456
4. 点击"登录"按钮
5. 应该成功跳转到 Dashboard

#### 2. 测试注册功能
1. 访问 http://localhost:3000/register
2. 选择"邮箱注册"选项卡
3. 填写表单：
   - 姓名: 测试用户
   - 邮箱: newuser@example.com
   - 密码: NewUser123
   - 确认密码: NewUser123
4. 点击"创建账户"
5. 应该自动登录并跳转到 Dashboard

#### 3. 测试忘记密码
1. 访问 http://localhost:3000/login
2. 选择"密码登录"选项卡
3. 点击"忘记密码？"链接
4. 输入邮箱: test@example.com
5. 点击"发送重置链接"
6. 检查控制台输出（开发环境）或邮箱（生产环境）
7. 访问重置链接
8. 设置新密码
9. 使用新密码登录

#### 4. 测试重置密码
1. 从邮件或控制台获取重置链接
2. 访问链接（格式：http://localhost:3000/reset-password?token=xxx）
3. 输入新密码（至少8位，包含字母和数字）
4. 确认新密码
5. 点击"重置密码"
6. 应该显示成功消息并自动跳转到登录页
7. 使用新密码登录

## 📧 邮件发送说明

### 开发环境
- 使用 Resend 测试 API Key
- 邮件会发送到真实的邮箱地址
- 可以在 Resend Dashboard 查看发送记录：https://resend.com/emails

### 生产环境
确保在 Vercel 或其他部署平台配置以下环境变量：
```env
RESEND_API_KEY=your_production_resend_key
EMAIL_FROM=SkillHub <noreply@yourdomain.com>
NEXTAUTH_URL=https://yourdomain.com
```

## 🔒 安全特性

1. **密码加密**：使用 bcrypt（salt rounds: 12）
2. **令牌安全**：
   - 随机生成的 32 字节令牌
   - 1 小时后自动过期
   - 使用后自动清除
3. **防枚举攻击**：
   - 即使用户不存在也返回成功消息
   - 不泄露用户是否存在的信息
4. **密码强度**：
   - 最少 8 个字符
   - 必须包含字母和数字

## 🐛 常见问题

### Q: Prisma 客户端更新失败？
**A**: 停止开发服务器后运行 `npx prisma generate`

### Q: 邮件没有收到？
**A**: 
1. 检查垃圾邮件文件夹
2. 验证 RESEND_API_KEY 是否正确
3. 查看控制台是否有错误信息
4. 访问 Resend Dashboard 查看发送状态

### Q: 重置链接无效？
**A**:
1. 检查令牌是否已过期（1小时）
2. 确认链接完整复制
3. 尝试重新请求重置

### Q: 登录后立即退出？
**A**: 检查 NextAuth 配置和会话设置

## 📝 API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/forgot-password` | POST | 请求密码重置 |
| `/api/auth/reset-password` | POST | 执行密码重置 |
| `/api/auth/[...nextauth]` | ALL | NextAuth 认证（包含 Credentials） |

## 🎯 下一步优化建议

1. **添加邮箱验证**：注册后发送验证邮件
2. **双因素认证 (2FA)**：增强账户安全性
3. **登录历史记录**：追踪账户活动
4. **密码强度指示器**：实时显示密码强度
5. **社交账号绑定**：允许将 OAuth 账号与密码登录关联
6. **速率限制**：防止暴力破解和密码重置滥用

---

**最后更新**: 2026-04-21  
**版本**: 1.0.0

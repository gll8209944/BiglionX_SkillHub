# 密码登录失败问题诊断与修复

## 问题描述

用户尝试使用密码登录时遇到以下错误：

```
login?error=CredentialsSignin&code=credentials
GET http://localhost:3000/dashboard 404 (Not Found)
Failed to fetch RSC payload for http://localhost:3000/login?error=CredentialsSignin&code=credentials
```

## 根本原因分析

### 1. 端口配置不匹配 ❌

**问题**: 
- `.env.local` 中配置的 `NEXTAUTH_URL=http://localhost:3000`
- 但开发服务器实际运行在 `http://localhost:3002`（因为 3000 和 3001 被占用）

**影响**:
- NextAuth 的回调 URL 和重定向 URL 都指向错误的端口
- 导致认证流程失败
- 浏览器尝试访问 `localhost:3000` 而不是实际的服务器端口

**证据**:
```
web:dev:  ⚠ Port 3000 is in use, trying 3001 instead.
web:dev:  ⚠ Port 3001 is in use, trying 3002 instead.
web:dev:   - Local:        http://localhost:3002
```

### 2. 登录失败后的重定向问题

**问题**:
- 登录失败后，NextAuth 重定向到 `/login?error=CredentialsSignin`
- 但由于端口不匹配，浏览器无法正确加载页面资源
- 导致 "Failed to fetch RSC payload" 错误

### 3. Dashboard 页面 404

**问题**:
- 登录成功后应该重定向到 `/dashboard`
- 但由于认证失败，重定向也失败了
- Dashboard 页面实际存在，只是无法访问

## 已验证的正常项 ✅

1. **测试用户存在且配置正确**
   - 邮箱: test@skillhub.com
   - 密码哈希: 正确（bcrypt $2b$12$...）
   - 账户状态: 正常（未禁用，已验证）

2. **密码验证逻辑正常**
   - bcrypt.compare() 测试通过
   - 正确密码可以验证
   - 错误密码被拒绝

3. **NextAuth 配置正确**
   - Credentials Provider 已配置
   - authorize 函数实现完整
   - 错误页面路径配置正确

4. **Dashboard 页面存在**
   - 文件位置: `app/dashboard/page.tsx`
   - 页面大小: 13.8KB

## 修复方案

### 方案 1: 更新 NEXTAUTH_URL（推荐）✅

**步骤**:
1. 检查当前服务器运行的端口
2. 更新 `.env.local` 中的 `NEXTAUTH_URL` 为正确的端口
3. 重启开发服务器

**执行**:
```bash
# 查看当前运行的端口
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3002

# 更新 .env.local
# 将 NEXTAUTH_URL 改为实际运行的端口
NEXTAUTH_URL=http://localhost:3002
```

**优点**:
- 简单直接
- 不需要修改代码
- 立即生效

**缺点**:
- 每次端口变化都需要手动更新

### 方案 2: 释放端口并固定使用 3000

**步骤**:
1. 停止占用 3000 端口的进程
2. 确保 NEXTAUTH_URL 配置为 3000
3. 重启开发服务器

**执行**:
```powershell
# 查找占用 3000 端口的进程
netstat -ano | findstr :3000

# 停止该进程（替换 PID）
taskkill /F /PID <PID>

# 或者使用更安全的命令
Get-Process -Id <PID> | Stop-Process -Force
```

**优点**:
- 端口固定，不需要频繁更新配置
- 符合开发习惯

**缺点**:
- 可能需要管理员权限
- 可能影响其他正在运行的服务

### 方案 3: 使用动态端口检测（长期方案）

**实现思路**:
修改 `redirect-url` API，使其能够自动检测当前服务器端口：

```typescript
// app/api/auth/redirect-url/route.ts
import { headers } from 'next/headers';

export async function GET() {
  const headersList = headers();
  const host = headersList.get('host');
  
  // 使用当前请求的主机作为基础URL
  const baseUrl = `http://${host}`;
  
  // ... 其余逻辑
}
```

**优点**:
- 自动适配任何端口
- 不需要手动配置
- 适合多环境部署

**缺点**:
- 需要修改代码
- 需要测试各种场景

## 当前状态

### 已完成
- ✅ 创建测试用户 (test@skillhub.com)
- ✅ 验证密码哈希正确
- ✅ 确认 NextAuth 配置正确
- ✅ 确认 Dashboard 页面存在
- ✅ 识别端口配置问题

### 待完成
- ⏳ 更新 NEXTAUTH_URL 配置
- ⏳ 重启开发服务器
- ⏳ 测试密码登录功能

## 测试步骤

修复后，请按以下步骤测试：

1. **清除浏览器缓存**
   - 打开开发者工具 (F12)
   - 右键刷新按钮 -> "清空缓存并硬性重新加载"

2. **访问登录页面**
   ```
   http://localhost:3002/login
   ```
   （注意：端口号根据实际运行情况调整）

3. **测试密码登录**
   - 点击"密码登录"选项卡
   - 输入邮箱: `test@skillhub.com`
   - 输入密码: `Test123456`
   - 点击"登录"

4. **验证登录成功**
   - 应重定向到 `/dashboard`
   - 导航栏显示用户信息
   - 访问 `/api/auth/session` 返回用户数据

5. **检查控制台**
   - 不应有 "CredentialsSignin" 错误
   - 不应有 404 错误
   - 不应有 "Failed to fetch" 错误

## 预防措施

### 1. 添加端口检查脚本

创建 `scripts/check-port.ts`:

```typescript
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const nextauthUrl = process.env.NEXTAUTH_URL;
console.log(`NEXTAUTH_URL: ${nextauthUrl}`);

// 可以在启动时自动检查端口是否可用
```

### 2. 使用 .env 模板

在 `.env.example` 中添加注释说明：

```env
# NextAuth 配置
# 重要：确保此URL与实际运行的服务器端口一致
# 开发环境通常为 http://localhost:3000
# 如果端口被占用，Next.js 会自动使用下一个可用端口
# 请根据实际情况更新此值
NEXTAUTH_URL=http://localhost:3000
```

### 3. 添加启动前检查

在 `package.json` 中添加 predev 脚本：

```json
{
  "scripts": {
    "predev": "node scripts/check-env.js",
    "dev": "next dev"
  }
}
```

## 相关文档

- [密码登录测试报告](./PASSWORD_LOGIN_TEST_REPORT.md)
- [密码登录快速测试指南](./PASSWORD_LOGIN_QUICK_TEST.md)
- [NextAuth 官方文档](https://next-auth.js.org/configuration/options)

## 总结

**主要问题**: NEXTAUTH_URL 配置与实际服务器端口不匹配

**解决方案**: 更新 `.env.local` 中的 NEXTAUTH_URL 为正确的端口号

**优先级**: 高（阻止登录功能使用）

**预计修复时间**: 5 分钟

---

**创建时间**: 2026年4月23日  
**最后更新**: 2026年4月23日  
**状态**: 待修复
# Prisma Client 重新生成指南

## ⚠️ 问题说明

在 Windows 系统上，Prisma Client 重新生成时可能会遇到 `EPERM: operation not permitted` 错误。这是因为 `query_engine-windows.dll.node` 文件被某个进程锁定（通常是正在运行的开发服务器）。

---

## 🔧 解决方案

### 方案 1: 重启开发服务器（推荐）⭐

1. **停止所有 Node.js 进程**
   ```powershell
   # 方法 A: 使用任务管理器
   # - 按 Ctrl+Shift+Esc 打开任务管理器
   # - 找到所有 node.exe 进程
   # - 右键点击 -> 结束任务

   # 方法 B: 使用命令行
   taskkill /F /IM node.exe
   ```

2. **重新生成 Prisma Client**
   ```bash
   cd apps/web
   npx prisma generate
   ```

3. **重启开发服务器**
   ```bash
   npm run dev
   ```

---

### 方案 2: 手动删除并重新生成

1. **关闭所有 VS Code 窗口和终端**

2. **删除 Prisma Client 目录**
   ```powershell
   cd apps/web
   Remove-Item -Path "node_modules\.prisma\client" -Recurse -Force
   ```

3. **重新生成**
   ```bash
   npx prisma generate
   ```

4. **重新启动 VS Code 和开发服务器**

---

### 方案 3: 使用 PowerShell 强制解锁

```powershell
# 1. 查找锁定文件的进程
Get-Process | Where-Object { $_.Modules.FileName -like "*query_engine*" }

# 2. 停止相关进程
Stop-Process -Name "node" -Force

# 3. 等待几秒
Start-Sleep -Seconds 3

# 4. 重新生成
npx prisma generate
```

---

## ✅ 验证是否成功

运行以下命令检查 Prisma Client 是否正确生成：

```bash
npx prisma validate
```

应该看到：
```
Validated prisma/schema.prisma in XXms
```

---

## 🎯 当前状态

✅ **已完成的步骤**:
1. ✅ Prisma Schema 已更新（添加了 `password` 字段）
2. ✅ 数据库迁移已成功执行 (`prisma db push`)
3. ✅ 注册 API 已更新（存储密码哈希）
4. ✅ auth-config.ts 已更新（启用密码验证）

⏳ **待完成**:
- 重新生成 Prisma Client（解决 TypeScript 类型错误）

---

## 📝 代码变更总结

### 1. Prisma Schema (`prisma/schema.prisma`)
```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  password        String?   // ← 新增
  name            String?
  image           String?
  emailVerified   DateTime?
  // ...
}
```

### 2. 注册 API (`app/api/auth/register/route.ts`)
```typescript
import bcrypt from 'bcryptjs';

// 哈希密码
const hashedPassword = await bcrypt.hash(password, 12);

// 创建用户时包含密码
const user = await prisma.user.create({
  data: {
    email,
    name: name || email.split('@')[0],
    password: hashedPassword, // ← 新增
    emailVerified: new Date(),
  },
});
```

### 3. Auth Config (`lib/auth-config.ts`)
```typescript
import bcrypt from 'bcryptjs';

async authorize(credentials) {
  // ...
  
  if (!user || !user.password) {
    return null;
  }

  // 验证密码
  const isValid = await bcrypt.compare(
    credentials.password as string,
    user.password
  );
  
  if (!isValid) {
    return null;
  }

  return { /* ... */ };
}
```

---

## 🚀 测试步骤

重新生成 Prisma Client 后，测试邮箱注册和登录：

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **测试注册**
   - 访问 http://localhost:3000/register
   - 切换到"邮箱注册"标签
   - 填写表单：
     - 姓名: Test User
     - 邮箱: test@example.com
     - 密码: Test1234
     - 确认密码: Test1234
   - 点击"创建账户"
   - 应该自动登录并跳转到 Dashboard

3. **测试登录**
   - 退出登录
   - 访问 http://localhost:3000/login
   - 使用刚才的邮箱和密码登录
   - 应该成功登录

---

## 💡 提示

- 如果仍然遇到问题，尝试重启电脑
- 确保没有其他 Node.js 进程在运行
- 检查是否有防病毒软件阻止文件操作

---

**预计解决时间**: 2-5 分钟  
**难度**: ⭐ (简单)

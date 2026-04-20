# 完成邮箱注册功能的最后步骤

## 📋 当前状态

✅ 已完成:
- 注册页面 UI（支持 GitHub 和邮箱注册）
- 注册 API（验证逻辑完整）
- NextAuth Credentials Provider 配置
- bcryptjs 已安装

⚠️ 待完成:
- Prisma Schema 需要添加 password 字段
- 注册 API 需要存储密码哈希
- 登录时需要验证密码

---

## 🔧 实施步骤

### 步骤 1: 更新 Prisma Schema

编辑文件: `apps/web/prisma/schema.prisma`

在 `User` 模型中添加 `password` 字段：

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  password        String?   // ← 添加这一行
  name            String?
  image           String?
  emailVerified   DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // ... 其他关系字段保持不变
}
```

### 步骤 2: 运行数据库迁移

在终端执行：

```bash
cd apps/web
npx prisma db push
```

或者使用迁移（推荐用于生产环境）：

```bash
npx prisma migrate dev --name add_password_to_user
```

### 步骤 3: 更新注册 API

编辑文件: `apps/web/app/api/auth/register/route.ts`

取消注释并启用密码存储：

```typescript
import bcrypt from 'bcryptjs'; // 确保导入

// 在创建用户之前添加：
const hashedPassword = await bcrypt.hash(password, 12);

// 创建用户时包含密码：
const user = await prisma.user.create({
  data: {
    email,
    name: name || email.split('@')[0],
    password: hashedPassword, // ← 添加这一行
    emailVerified: new Date(),
  },
});
```

### 步骤 4: 启用密码验证

编辑文件: `apps/web/lib/auth-config.ts`

在 Credentials Provider 的 `authorize` 函数中：

```typescript
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string },
  });

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

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
}
```

### 步骤 5: 测试注册和登录

1. **测试注册**:
   ```bash
   cd apps/web
   npm run dev
   ```
   
   访问 http://localhost:3000/register
   - 切换到"邮箱注册"标签
   - 填写表单并提交
   - 应该成功注册并自动登录

2. **测试登录**:
   - 退出登录
   - 访问 http://localhost:3000/login
   - 使用刚才注册的邮箱和密码登录
   - 应该成功登录

---

## 🧪 验证清单

- [ ] Prisma Schema 已更新
- [ ] 数据库迁移已成功执行
- [ ] 注册 API 可以存储密码哈希
- [ ] 登录时可以验证密码
- [ ] 新用户注册流程正常
- [ ] 现有用户（GitHub OAuth）不受影响
- [ ] 错误处理正常工作

---

## ⚠️ 注意事项

### 1. 现有用户兼容性
通过 GitHub OAuth 注册的用户没有密码字段，这是正常的。他们继续使用 OAuth 登录。

### 2. 密码安全
- bcrypt 使用 12 轮哈希，安全性良好
- 密码永远不会以明文形式存储
- 考虑添加速率限制防止暴力破解

### 3. 邮箱验证（可选增强）
当前实现自动验证邮箱（`emailVerified: new Date()`）。如果需要真正的邮箱验证：

1. 生成验证令牌
2. 发送验证邮件
3. 用户点击链接后设置 `emailVerified`

### 4. 忘记密码功能
建议后续实现：
- 创建 `/api/auth/forgot-password` API
- 创建 `/api/auth/reset-password` API
- 添加重置密码页面

---

## 🚀 快速执行命令

```bash
# 1. 进入 web 应用目录
cd apps/web

# 2. 更新 Prisma Schema（手动编辑）
# 编辑 prisma/schema.prisma，添加 password 字段

# 3. 推送数据库变更
npx prisma db push

# 4. 更新代码（按照上述步骤 3-4）
# 编辑 app/api/auth/register/route.ts
# 编辑 lib/auth-config.ts

# 5. 重启开发服务器
npm run dev
```

---

## 📚 相关文档

- [NextAuth Credentials Provider](https://next-auth.js.org/configuration/providers/credentials)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)

---

**预计完成时间**: 15-30 分钟  
**难度**: ⭐⭐ (简单)

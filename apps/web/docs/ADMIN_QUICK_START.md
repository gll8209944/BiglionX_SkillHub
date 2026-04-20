# 管理员功能快速启动指南

## 🚀 5 分钟快速配置

### 步骤 1: 配置管理员邮箱

编辑 `.env.local` 文件，添加你的邮箱作为管理员：

```bash
# 在 .env.local 中添加
ADMIN_EMAILS="your-email@example.com"
```

**注意**: 
- 多个邮箱用逗号分隔：`ADMIN_EMAILS="admin1@test.com,admin2@test.com"`
- 不要有空格
- 邮箱必须与登录邮箱完全匹配

### 步骤 2: 更新数据库 Schema

在项目根目录运行：

```bash
cd apps/web
npx prisma generate
```

如果遇到文件占用错误，先停止开发服务器（Ctrl+C），然后再运行。

### 步骤 3: 运行数据库迁移

```bash
npx prisma migrate dev --name add_user_role_and_disabled
```

这会：
- 创建迁移文件
- 执行数据库变更（添加 role 和 isDisabled 字段）
- 重新生成 Prisma Client

### 步骤 4: 重启开发服务器

```bash
npm run dev
```

### 步骤 5: 验证配置

1. 访问 http://localhost:3001/admin
2. 应该能正常进入管理后台
3. 访问 http://localhost:3001/admin/users
4. 查看用户列表页面

## ✅ 功能测试

### 测试 1: 权限检查

尝试访问 admin 页面：
- ✅ 已配置的邮箱可以访问
- ❌ 未配置的邮箱会被重定向到 /dashboard

### 测试 2: 批量操作

在浏览器控制台测试：

```javascript
// 选择一些用户 ID
const userIds = ['user-id-1', 'user-id-2'];

// 批量禁用
fetch('/api/admin/users/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds,
    action: 'disable'
  })
})
.then(r => r.json())
.then(console.log);
```

### 测试 3: 编辑用户

```javascript
// 更新用户信息
fetch('/api/admin/users/user-id-123/update', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '新姓名',
    role: 'ADMIN'
  })
})
.then(r => r.json())
.then(console.log);
```

## 🔧 常见问题

### Q1: 提示 "需要管理员权限"

**原因**: 邮箱未在 ADMIN_EMAILS 中配置

**解决**:
1. 检查 `.env.local` 中的 `ADMIN_EMAILS`
2. 确认邮箱地址完全匹配
3. 重启开发服务器

### Q2: Prisma 类型错误

**症状**: TypeScript 报错说 `role` 或 `isDisabled` 不存在

**解决**:
```bash
npx prisma generate
```

如果还是报错，删除缓存后重新生成：
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Q3: 数据库迁移失败

**原因**: 可能有未提交的更改

**解决**:
```bash
# 重置数据库（注意：会丢失数据！）
npx prisma migrate reset

# 或者强制创建迁移
npx prisma migrate dev --create-only
```

### Q4: 批量操作没有效果

**检查**:
1. 确认用户 ID 正确
2. 查看浏览器控制台的响应
3. 检查审计日志 `/admin/audit-logs`

## 📝 设置第一个管理员

### 方法 1: 使用 Prisma Studio（推荐）

```bash
npx prisma studio
```

1. 打开 http://localhost:5555
2. 找到 User 表
3. 点击你的用户记录
4. 将 `role` 字段改为 `ADMIN`
5. 保存

### 方法 2: 使用 SQL

连接到数据库后执行：

```sql
UPDATE users 
SET role = 'ADMIN' 
WHERE email = 'your-email@example.com';
```

### 方法 3: 使用脚本

创建 `scripts/set-first-admin.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  
  if (!email) {
    console.error('请提供邮箱地址');
    console.error('用法: npx ts-node scripts/set-first-admin.ts your@email.com');
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });

  console.log(`✅ ${email} 已设置为管理员`);
  console.log('用户 ID:', user.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

运行：
```bash
npx ts-node scripts/set-first-admin.ts your-email@example.com
```

## 🎯 下一步

1. **熟悉管理后台**
   - 浏览所有管理页面
   - 查看用户列表
   - 检查审计日志

2. **测试批量操作**
   - 选择多个用户
   - 尝试批量禁用/启用
   - 查看操作结果

3. **编辑用户信息**
   - 修改用户姓名
   - 更改用户角色
   - 验证邮箱

4. **查看文档**
   - 阅读 [ADMIN_USERS_ENHANCEMENTS.md](./ADMIN_USERS_ENHANCEMENTS.md)
   - 了解完整的 API 文档
   - 学习最佳实践

## 🔐 安全提醒

1. **保护 ADMIN_EMAILS**
   - 不要提交到 Git
   - 在生产环境使用环境变量管理服务

2. **定期审计**
   - 查看审计日志
   - 检查管理员操作
   - 监控异常行为

3. **最小权限原则**
   - 只给必要的人管理员权限
   - 定期审查管理员列表
   - 及时移除离职人员权限

## 📞 需要帮助？

如果遇到问题：

1. 检查控制台错误信息
2. 查看审计日志 `/admin/audit-logs`
3. 阅读完整文档 [ADMIN_USERS_ENHANCEMENTS.md](./ADMIN_USERS_ENHANCEMENTS.md)
4. 检查 Prisma 日志

---

**祝使用愉快！** 🎉

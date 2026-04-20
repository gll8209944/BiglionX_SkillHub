# Admin 用户管理增强功能

## 新增功能概览

本次更新实现了三个核心功能：

1. ✅ **管理员角色检查** - 基于邮箱列表的权限控制
2. ✅ **批量操作** - 支持批量禁用/启用/验证/删除用户
3. ✅ **编辑用户功能** - 完整的用户信息编辑 API

## 一、管理员角色检查

### 实现方式

采用基于邮箱列表的临时方案，无需修改数据库即可快速部署。

### 配置方法

在 `.env.local` 文件中添加：

```bash
# 管理员邮箱列表（逗号分隔）
ADMIN_EMAILS=admin@example.com,superadmin@example.com
```

### 使用示例

#### 1. 在页面中检查权限

```typescript
import { requireAdmin } from '@/lib/admin-auth';

export default async function AdminPage() {
  // 如果不是管理员，会自动重定向
  const session = await requireAdmin();
  
  return <div>管理员页面内容</div>;
}
```

#### 2. 在 API 中检查权限

```typescript
import { checkAdminPermission } from '@/lib/admin-auth';

export async function GET() {
  const isAdmin = await checkAdminPermission();
  
  if (!isAdmin) {
    return NextResponse.json({ error: '需要管理员权限' }, { status: 403 });
  }
  
  // 管理员逻辑
}
```

#### 3. 获取用户角色

```typescript
import { getUserRole } from '@/lib/admin-auth';

const role = await getUserRole();
// 返回: 'ADMIN' | 'USER' | null
```

### 已更新的文件

- ✅ `/lib/admin-auth.ts` - 权限检查工具函数
- ✅ `/app/admin/layout.tsx` - 使用 `requireAdmin()` 保护所有 admin 页面

## 二、批量操作功能

### API 端点

**POST /api/admin/users/batch**

### 请求格式

```json
{
  "userIds": ["user-id-1", "user-id-2", "user-id-3"],
  "action": "disable"
}
```

### 支持的操作

| 操作 | 说明 |
|------|------|
| `disable` | 批量禁用用户 |
| `enable` | 批量启用用户 |
| `verify_email` | 批量验证邮箱 |
| `delete` | 批量删除用户（会跳过有关联 Skills 的用户） |

### 响应格式

```json
{
  "success": true,
  "message": "批量操作完成：成功 2 个，失败 1 个",
  "results": {
    "success": ["user-id-1", "user-id-2"],
    "failed": [
      {
        "userId": "user-id-3",
        "reason": "该用户有 5 个 Skills，无法删除"
      }
    ]
  }
}
```

### 前端调用示例

```typescript
async function batchDisableUsers(userIds: string[]) {
  const response = await fetch('/api/admin/users/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userIds,
      action: 'disable',
    }),
  });

  const result = await response.json();
  
  if (result.success) {
    console.log(`成功: ${result.results.success.length}`);
    console.log(`失败: ${result.results.failed.length}`);
  }
}
```

### 特性

- ✅ 逐个处理，单个失败不影响其他用户
- ✅ 详细的成功/失败报告
- ✅ 自动记录审计日志
- ✅ 删除前检查关联数据
- ✅ 标记为批量操作（batchOperation: true）

## 三、编辑用户功能

### API 端点

**PATCH /api/admin/users/[id]/update**

### 请求格式

```json
{
  "name": "新姓名",
  "email": "newemail@example.com",
  "role": "ADMIN",
  "isDisabled": false
}
```

所有字段都是可选的，只更新提供的字段。

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 用户姓名（2-50字符） |
| `email` | string | 邮箱地址（需唯一） |
| `role` | enum | 用户角色：USER, ADMIN, SUPER_ADMIN |
| `isDisabled` | boolean | 是否禁用账户 |

### 响应格式

**成功：**
```json
{
  "success": true,
  "message": "用户信息更新成功",
  "user": {
    "id": "user-id",
    "name": "新姓名",
    "email": "newemail@example.com",
    "role": "ADMIN",
    "isDisabled": false,
    ...
  }
}
```

**失败：**
```json
{
  "error": "该邮箱已被其他用户使用"
}
```

### 前端调用示例

```typescript
async function updateUser(userId: string, updates: any) {
  const response = await fetch(`/api/admin/users/${userId}/update`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('更新成功', result.user);
  } else {
    console.error('更新失败', result.error);
  }
}

// 使用示例
await updateUser('user-id-123', {
  name: '张三',
  role: 'ADMIN',
});
```

### 特性

- ✅ Zod 输入验证
- ✅ 邮箱唯一性检查
- ✅ 变更记录追踪
- ✅ 审计日志记录
- ✅ 不返回敏感数据（password）

## 四、数据库迁移

### 重要提示

由于添加了新的字段（`role` 和 `isDisabled`），需要执行数据库迁移。

### 步骤

1. **停止开发服务器**（如果正在运行）

2. **生成 Prisma Client**
   ```bash
   cd apps/web
   npx prisma generate
   ```

3. **创建迁移文件**
   ```bash
   npx prisma migrate dev --name add_user_role_and_disabled
   ```

4. **重启开发服务器**
   ```bash
   npm run dev
   ```

### 手动设置管理员

迁移完成后，可以通过以下方式设置管理员：

#### 方法 1: 使用 Prisma Studio
```bash
npx prisma studio
```
然后在界面中编辑用户，设置 `role` 为 `ADMIN`。

#### 方法 2: 使用脚本
创建脚本 `scripts/set-admin.ts`:
```typescript
import { prisma } from '../apps/web/lib/prisma';

async function setAdmin(email: string) {
  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  console.log(`${email} 已设置为管理员`);
}

setAdmin('your-email@example.com');
```

运行：
```bash
npx ts-node scripts/set-admin.ts
```

#### 方法 3: 直接 SQL
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

## 五、环境变量配置

在 `.env.local` 中添加：

```bash
# 管理员邮箱列表（逗号分隔）
ADMIN_EMAILS=admin@example.com,superadmin@example.com
```

**注意**：多个邮箱用逗号分隔，不要有空格。

## 六、安全考虑

### 1. 权限验证
- 所有 admin API 都验证管理员权限
- 使用邮箱白名单机制
- 未授权访问返回 403

### 2. 审计日志
- 所有用户操作都记录到审计日志
- 包含操作人、时间、变更内容
- 批量操作标记为 `batchOperation: true`

### 3. 数据保护
- 删除用户前检查关联数据
- 邮箱修改时检查唯一性
- 不返回敏感字段（password）

### 4. 输入验证
- 使用 Zod 进行严格的输入验证
- 防止无效数据进入数据库
- 提供清晰的错误提示

## 七、后续优化建议

### 短期
1. 从邮箱列表迁移到数据库角色字段
2. 添加角色管理界面
3. 实现更细粒度的权限控制

### 中期
1. 添加操作确认对话框
2. 实现撤销功能
3. 添加操作历史记录查看

### 长期
1. 实现 RBAC（基于角色的访问控制）
2. 添加权限继承机制
3. 实现操作审批流程

## 八、故障排查

### 问题 1: Prisma Client 类型错误

**症状**：TypeScript 报错说 `role` 或 `isDisabled` 不存在

**解决**：
```bash
npx prisma generate
```

### 问题 2: 管理员权限检查失败

**症状**：即使配置了 ADMIN_EMAILS 仍然被重定向

**检查**：
1. 确认 `.env.local` 文件存在
2. 确认邮箱地址完全匹配（区分大小写）
3. 重启开发服务器

### 问题 3: 批量操作部分失败

**症状**：有些用户操作成功，有些失败

**解决**：
- 查看 `results.failed` 数组了解失败原因
- 常见原因：用户不存在、有关联数据等
- 这是正常行为，不会回滚成功的操作

## 九、API 总结

| 端点 | 方法 | 功能 | 权限 |
|------|------|------|------|
| `/api/admin/users/batch` | POST | 批量操作 | 管理员 |
| `/api/admin/users/[id]/update` | PATCH | 更新用户 | 管理员 |
| `/api/admin/users/[id]` | PATCH | 简单操作 | 管理员 |
| `/api/admin/users/[id]` | DELETE | 删除用户 | 管理员 |

## 十、代码文件清单

### 新增文件
- ✅ `/lib/admin-auth.ts` - 权限检查工具
- ✅ `/app/api/admin/users/batch/route.ts` - 批量操作 API
- ✅ `/app/api/admin/users/[id]/update/route.ts` - 编辑用户 API

### 修改文件
- ✅ `/prisma/schema.prisma` - 添加 role 和 isDisabled 字段
- ✅ `/app/admin/layout.tsx` - 使用 requireAdmin()

### 文档
- ✅ `/docs/ADMIN_USERS_ENHANCEMENTS.md` - 本文档

---

**最后更新**: 2026-04-19
**版本**: v1.1.0

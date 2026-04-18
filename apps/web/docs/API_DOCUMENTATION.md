# Skill Hub API 文档

**版本**: v1.0  
**基础 URL**: `http://localhost:3000/api`  
**认证**: NextAuth Session (Bearer Token)

---

## 📋 目录

- [通用响应格式](#通用响应格式)
- [Skills API](#skills-api)
- [Namespaces API](#namespaces-api)
- [认证](#认证)
- [错误码](#错误码)

---

## 📦 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误描述",
  "errors": [ ... ]  // 可选
}
```

---

## 🎯 Skills API

### 1. 获取技能列表

**端点**: `GET /api/skills`

**查询参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| limit | number | 20 | 每页数量 |
| search | string | - | 搜索关键词 |
| status | string | - | 状态过滤 |
| namespaceId | string | - | 命名空间 ID |
| sortBy | string | createdAt | 排序字段 |
| sortOrder | string | desc | 排序方向 (asc/desc) |

**示例请求**:

```bash
curl http://localhost:3000/api/skills?page=1&limit=10&search=python
```

**示例响应**:

```json
{
  "success": true,
  "data": {
    "skills": [
      {
        "id": "uuid-123",
        "name": "Python Data Analysis",
        "slug": "python-data-analysis",
        "description": "A skill for data analysis",
        "status": "APPROVED",
        "category": "data-science",
        "tags": ["python", "pandas", "numpy"],
        "author": {
          "id": "user-123",
          "name": "John Doe",
          "image": "https://..."
        },
        "namespace": {
          "id": "ns-123",
          "slug": "my-namespace",
          "name": "My Namespace"
        },
        "_count": {
          "versions": 5,
          "downloads": 1234
        },
        "createdAt": "2026-04-16T00:00:00.000Z",
        "updatedAt": "2026-04-16T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

**权限**: 
- 未登录用户只能看到 `APPROVED` 状态的技能
- 登录用户可以看到自己的所有技能

---

### 2. 创建技能

**端点**: `POST /api/skills`

**认证**: 需要登录

**请求体**:

```json
{
  "name": "My New Skill",
  "slug": "my-new-skill",
  "description": "Skill description",
  "repositoryUrl": "https://github.com/user/repo",
  "category": "ai-agent",
  "tags": ["tag1", "tag2"],
  "namespaceId": "optional-namespace-id"
}
```

**必填字段**:
- `name`: 技能名称
- `slug`: 唯一标识符（小写字母、数字、连字符）

**示例请求**:

```bash
curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Test Skill",
    "slug": "test-skill",
    "description": "A test skill",
    "category": "testing"
  }'
```

**示例响应** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Test Skill",
    "slug": "test-skill",
    "description": "A test skill",
    "status": "DRAFT",
    "category": "testing",
    "tags": [],
    "authorId": "user-123",
    "author": {
      "id": "user-123",
      "name": "John Doe",
      "image": "https://..."
    },
    "createdAt": "2026-04-16T00:00:00.000Z",
    "updatedAt": "2026-04-16T00:00:00.000Z"
  }
}
```

**错误响应**:

```json
{
  "success": false,
  "message": "Slug 已存在",
  "errors": []
}
```

---

### 3. 获取技能详情

**端点**: `GET /api/skills/:id`

**路径参数**:
- `id`: 技能 ID

**示例请求**:

```bash
curl http://localhost:3000/api/skills/uuid-123
```

**示例响应**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Python Data Analysis",
    "slug": "python-data-analysis",
    "description": "A comprehensive skill for data analysis",
    "repositoryUrl": "https://github.com/user/repo",
    "status": "APPROVED",
    "category": "data-science",
    "tags": ["python", "pandas"],
    "author": {
      "id": "user-123",
      "name": "John Doe",
      "image": "https://..."
    },
    "namespace": {
      "id": "ns-123",
      "slug": "my-namespace",
      "name": "My Namespace"
    },
    "versions": [
      {
        "id": "v1-123",
        "version": "1.0.0",
        "changelog": "Initial release",
        "createdAt": "2026-04-16T00:00:00.000Z"
      }
    ],
    "_count": {
      "versions": 5,
      "downloads": 1234,
      "reviews": 2
    },
    "createdAt": "2026-04-16T00:00:00.000Z",
    "updatedAt": "2026-04-16T00:00:00.000Z"
  }
}
```

---

### 4. 更新技能

**端点**: `PUT /api/skills/:id`

**认证**: 需要登录（仅作者或管理员）

**请求体**:

```json
{
  "name": "Updated Skill Name",
  "slug": "updated-slug",
  "description": "Updated description",
  "repositoryUrl": "https://github.com/user/new-repo",
  "category": "new-category",
  "tags": ["new-tag1", "new-tag2"]
}
```

**示例请求**:

```bash
curl -X PUT http://localhost:3000/api/skills/uuid-123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "name": "Updated Name",
    "description": "Updated description"
  }'
```

**示例响应**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Updated Name",
    "slug": "python-data-analysis",
    "description": "Updated description",
    ...
  }
}
```

**权限检查**:
- 只有技能的作者可以更新
- 未来将支持管理员权限

---

### 5. 删除技能（归档）

**端点**: `DELETE /api/skills/:id`

**认证**: 需要登录（仅作者或管理员）

**说明**: 此操作不会真正删除技能，而是将其状态设置为 `ARCHIVED`

**示例请求**:

```bash
curl -X DELETE http://localhost:3000/api/skills/uuid-123 \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"
```

**示例响应**:

```json
{
  "success": true,
  "data": {
    "message": "技能已归档"
  }
}
```

---

## 🏢 Namespaces API

### 1. 获取命名空间列表

**端点**: `GET /api/namespaces`

**查询参数**:

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码 |
| limit | number | 20 | 每页数量 |
| type | string | - | 类型过滤 (PERSONAL/TEAM/GLOBAL) |
| search | string | - | 搜索关键词 |

**示例请求**:

```bash
curl http://localhost:3000/api/namespaces?type=TEAM
```

**示例响应**:

```json
{
  "success": true,
  "data": {
    "namespaces": [
      {
        "id": "ns-123",
        "name": "My Team",
        "slug": "my-team",
        "description": "Team workspace",
        "type": "TEAM",
        "owner": {
          "id": "user-123",
          "name": "John Doe",
          "image": "https://..."
        },
        "_count": {
          "skills": 10,
          "members": 5
        },
        "createdAt": "2026-04-16T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

**权限**:
- 未登录用户只能看到 `GLOBAL` 类型的命名空间
- 登录用户可以看到所有类型

---

### 2. 创建命名空间

**端点**: `POST /api/namespaces`

**认证**: 需要登录

**请求体**:

```json
{
  "name": "My New Namespace",
  "slug": "my-new-namespace",
  "description": "Namespace description",
  "type": "PERSONAL"
}
```

**必填字段**:
- `name`: 命名空间名称
- `slug`: 唯一标识符
- `type`: 类型 (PERSONAL/TEAM/GLOBAL)

**类型说明**:
- `PERSONAL`: 个人命名空间
- `TEAM`: 团队命名空间
- `GLOBAL`: 全局命名空间（需要管理员权限，暂不允许创建）

**示例请求**:

```bash
curl -X POST http://localhost:3000/api/namespaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "name": "My Workspace",
    "slug": "my-workspace",
    "description": "Personal workspace",
    "type": "PERSONAL"
  }'
```

**示例响应** (201 Created):

```json
{
  "success": true,
  "data": {
    "id": "ns-123",
    "name": "My Workspace",
    "slug": "my-workspace",
    "description": "Personal workspace",
    "type": "PERSONAL",
    "ownerId": "user-123",
    "owner": {
      "id": "user-123",
      "name": "John Doe",
      "image": "https://..."
    },
    "createdAt": "2026-04-16T00:00:00.000Z",
    "updatedAt": "2026-04-16T00:00:00.000Z"
  }
}
```

**注意**: 创建者会自动成为命名空间的 OWNER 成员

---

## 🔐 认证

### 获取 Session Token

使用 NextAuth 登录后，Session 会自动存储在 Cookie 中。

对于 API 调用，你可以：

1. **浏览器环境**: Cookie 自动发送
2. **服务器端**: 使用 `auth()` 函数获取会话

```typescript
import { auth } from '@/lib/auth-config';

const session = await auth();
if (!session) {
  return unauthorizedResponse();
}
```

---

## ❌ 错误码

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权（需要登录） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 常见错误消息

- `"名称和 Slug 为必填项"` - 缺少必填字段
- `"Slug 已存在"` - Slug 已被使用
- `"未授权访问"` - 需要登录
- `"没有权限更新此技能"` - 不是作者或管理员
- `"技能不存在"` - ID 无效
- `"无效的命名空间类型"` - 类型不在允许列表中

---

## 🧪 测试示例

### 使用 cURL 测试

```bash
# 1. 获取技能列表
curl http://localhost:3000/api/skills

# 2. 创建技能（需要先登录获取 Cookie）
curl -X POST http://localhost:3000/api/skills \
  -H "Content-Type: application/json" \
  --cookie "next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "Test Skill",
    "slug": "test-skill",
    "description": "A test",
    "category": "testing"
  }'

# 3. 获取命名空间列表
curl http://localhost:3000/api/namespaces

# 4. 创建命名空间
curl -X POST http://localhost:3000/api/namespaces \
  -H "Content-Type: application/json" \
  --cookie "next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "name": "My Workspace",
    "slug": "my-workspace",
    "type": "PERSONAL"
  }'
```

### 使用 JavaScript Fetch

```javascript
// 获取技能列表
const response = await fetch('/api/skills?page=1&limit=10');
const data = await response.json();
console.log(data.data.skills);

// 创建技能
const createResponse = await fetch('/api/skills', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Skill',
    slug: 'my-skill',
    description: 'Description',
    category: 'ai-agent',
  }),
});

const created = await createResponse.json();
console.log(created.data);
```

---

## 📝 注意事项

1. **Slug 唯一性**: 每个技能和命名空间的 slug 必须唯一
2. **软删除**: 删除操作只是归档，不会真正删除数据
3. **权限控制**: 只有作者可以更新/删除自己的技能
4. **分页**: 默认每页 20 条，最大可设置 100 条
5. **搜索**: 支持不区分大小写的模糊搜索
6. **状态管理**: 新创建的技能默认为 DRAFT 状态

---

## 🚀 下一步

计划中的 API：

- [ ] Reviews API（审核系统）
- [ ] Versions API（版本管理）
- [ ] Downloads API（下载统计）
- [ ] Members API（命名空间成员管理）
- [ ] Audit Logs API（审计日志）

---

**最后更新**: 2026-04-16  
**API 版本**: v1.0  
**框架**: Next.js 14 App Router

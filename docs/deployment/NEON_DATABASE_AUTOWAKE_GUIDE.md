# Neon 数据库自动唤醒配置指南

## 📋 概述

Neon 是一个 Serverless PostgreSQL 数据库服务，为了节省资源，它会在闲置一段时间后进入**休眠状态**。本指南介绍如何配置和优化 Neon 数据库的自动唤醒机制。

---

## 🔍 Neon 工作原理

### 休眠与唤醒
1. **休眠触发**: 数据库在 5-10 分钟无活动后进入休眠
2. **自动唤醒**: 新的连接请求会自动唤醒数据库（通常需要 1-5 秒）
3. **首次连接延迟**: 唤醒期间的第一个查询会有额外延迟

### 免费套餐限制
- **最大连接数**: 1 个并发连接
- **存储**: 500 MB
- **计算时间**: 每月一定小时数

---

## ✅ 已实施的优化方案

### 1. 数据库健康检查工具

创建了 `apps/web/lib/db-health.ts`，提供以下功能：

#### `ensureDatabaseConnection()`
```typescript
// 自动重试连接，最多尝试 3 次，每次间隔 2 秒
const connected = await ensureDatabaseConnection(3, 2000);
```

**特点**:
- ✅ 自动检测连接超时
- ✅ 智能重试机制
- ✅ 详细的错误日志
- ✅ 区分临时错误和永久错误

#### `getDatabaseStatus()`
```typescript
// 获取数据库连接状态和延迟
const status = await getDatabaseStatus();
console.log(status); // { connected: true, latency: 45 }
```

#### `startDatabaseHeartbeat()`
```typescript
// 每 5 分钟发送心跳，保持数据库活跃
const stopHeartbeat = startDatabaseHeartbeat(5 * 60 * 1000);

// 需要时停止心跳
stopHeartbeat();
```

### 2. TaskScheduler 集成

TaskScheduler 在启动时会自动检查数据库连接：

```typescript
async start(): Promise<void> {
  // 首先确保数据库连接可用（Neon 自动唤醒）
  console.log('🔍 Checking database connection...');
  const dbConnected = await ensureDatabaseConnection(3, 2000);
  
  if (!dbConnected) {
    console.warn('⚠️  Database connection failed, scheduler will retry later');
  } else {
    console.log('✅ Database connection established');
  }
  
  // ... 继续加载配置
}
```

### 3. Prisma 客户端优化

更新了 `apps/web/lib/prisma.ts`，添加了更好的错误处理：

```typescript
(prisma as any).$on('error', (e: { message: string }) => {
  if (e.message.includes('terminating connection')) {
    console.log('⚠️  Neon 连接重置（正常现象，将自动重连）');
  } else if (e.message.includes('connection timed out')) {
    console.log('⏰ 连接超时，Neon 可能正在唤醒...');
  } else {
    console.error('Prisma error:', e);
  }
});
```

---

## 🚀 Vercel 部署配置

### 必需的环境变量

在 Vercel Dashboard 中设置：

```bash
# 数据库连接（使用连接池器以获得更好性能）
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# 直接连接 URL（用于迁移等操作）
DIRECT_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Prisma 优化
PRISMA_GENERATE_SKIP_AUTOINSTALL=true
```

### ⚠️ 重要提示

1. **不要使用连接池器参数**: 
   - ❌ 错误: `?pgbouncer=true&connection_limit=1`
   - ✅ 正确: `?sslmode=require`
   - 原因: Vercel Serverless Functions 有自己的连接管理

2. **SSL 模式必须启用**:
   - Neon 要求所有连接都使用 SSL
   - 确保 URL 中包含 `sslmode=require`

---

## 💡 最佳实践

### 1. 避免频繁唤醒

**问题**: 如果应用持续产生新连接，会导致数据库频繁唤醒和休眠

**解决方案**:
```typescript
// ✅ 好：使用单例模式复用 Prisma 客户端
import { prisma } from '@/lib/prisma';

// ❌ 坏：每次请求都创建新客户端
const prisma = new PrismaClient();
```

### 2. 合理设置心跳间隔

```typescript
// 生产环境：每 5 分钟发送一次心跳
const stopHeartbeat = startDatabaseHeartbeat(5 * 60 * 1000);

// 开发环境：可以更频繁（但不建议低于 1 分钟）
const stopHeartbeat = startDatabaseHeartbeat(1 * 60 * 1000);
```

### 3. 优雅处理连接错误

```typescript
try {
  const skills = await prisma.skill.findMany();
} catch (error) {
  if (error.message.includes('connection timed out')) {
    // 等待后重试
    await new Promise(resolve => setTimeout(resolve, 2000));
    const skills = await prisma.skill.findMany();
  } else {
    throw error;
  }
}
```

### 4. 监控数据库状态

可以创建一个 API 端点来监控数据库健康：

```typescript
// app/api/health/db/route.ts
import { NextResponse } from 'next/server';
import { getDatabaseStatus } from '@/lib/db-health';

export async function GET() {
  const status = await getDatabaseStatus();
  
  return NextResponse.json({
    database: status,
    timestamp: new Date().toISOString(),
  });
}
```

访问 `https://your-domain.com/api/health/db` 即可查看数据库状态。

---

## 🔧 故障排查

### 问题 1: 首次加载页面很慢（5-10 秒）

**原因**: Neon 数据库正在从休眠状态唤醒

**解决方案**:
1. ✅ 已实施：`ensureDatabaseConnection()` 会自动重试
2. 可选：设置定期心跳保持数据库活跃
3. 考虑升级到付费套餐（无休眠）

### 问题 2: 偶尔出现 "Connection terminated unexpectedly"

**原因**: Neon 在空闲时主动关闭连接

**解决方案**:
```typescript
// Prisma 会自动重连，只需确保捕获并记录
(prisma as any).$on('error', (e) => {
  if (e.message.includes('terminating connection')) {
    console.log('⚠️  Connection reset, will reconnect automatically');
  }
});
```

### 问题 3: 部署后数据库连接失败

**检查清单**:
1. ✅ 确认 `DATABASE_URL` 环境变量已正确设置
2. ✅ 确认 URL 格式正确（包含 `sslmode=require`）
3. ✅ 确认 Neon 项目处于活跃状态
4. ✅ 检查 Vercel 函数日志中的详细错误信息

**调试步骤**:
```bash
# 1. 查看 Vercel 函数日志
vercel logs your-deployment-url --follow

# 2. 测试数据库连接
curl https://your-domain.com/api/health/db

# 3. 检查环境变量
vercel env ls
```

---

## 📊 性能优化建议

### 1. 使用边缘缓存

对于不经常变化的数据，使用 Next.js ISR：

```typescript
export const revalidate = 300; // 5 分钟重新验证

export default async function SkillsPage() {
  const skills = await prisma.skill.findMany();
  // ...
}
```

### 2. 减少不必要的查询

```typescript
// ❌ 坏：多次查询
const skills = await prisma.skill.findMany();
const count = await prisma.skill.count();

// ✅ 好：单次查询获取所有需要的数据
const [skills, count] = await prisma.$transaction([
  prisma.skill.findMany({ take: 20 }),
  prisma.skill.count(),
]);
```

### 3. 选择性加载字段

```typescript
// ❌ 坏：加载所有字段
const skills = await prisma.skill.findMany();

// ✅ 好：只加载需要的字段
const skills = await prisma.skill.findMany({
  select: {
    id: true,
    name: true,
    slug: true,
    description: true,
  },
});
```

---

## 🎯 总结

### 当前配置状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 自动重试连接 | ✅ 已实施 | 最多重试 3 次 |
| 连接超时检测 | ✅ 已实施 | 智能识别 Neon 唤醒 |
| 错误日志记录 | ✅ 已实施 | 详细的诊断信息 |
| TaskScheduler 集成 | ✅ 已实施 | 启动时检查连接 |
| 心跳机制 | ✅ 可用 | 按需启用 |
| 健康检查 API | 📝 待实现 | 可添加监控端点 |

### 下一步建议

1. **短期**: 
   - 监控 Vercel 部署后的实际表现
   - 根据日志调整重试参数

2. **中期**:
   - 添加数据库健康检查 API 端点
   - 设置告警通知（连接失败时）

3. **长期**:
   - 如果流量增长，考虑升级到 Neon 付费套餐
   - 实施更高级的连接池策略

---

## 📚 相关资源

- [Neon 官方文档](https://neon.tech/docs)
- [Neon 休眠机制](https://neon.tech/docs/introduction/about#serverless-architecture)
- [Prisma Neon 适配器](https://www.prisma.io/docs/guides/database/neon)
- [Vercel + Neon 最佳实践](https://vercel.com/docs/storage/neon)

---

**最后更新**: 2026-05-15  
**版本**: 1.0.0

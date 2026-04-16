# Neon 数据库配置指南

## 📋 前置要求

1. **Neon 账户**: 注册 https://neon.tech
2. **项目 ID**: 从 Neon Dashboard 获取

---

## 🔧 配置步骤

### Step 1: 创建 Neon 项目

1. 访问 [Neon Console](https://console.neon.tech)
2. 点击 "New Project"
3. 填写项目信息：
   - **Project name**: Skill Hub
   - **Database name**: skillhub
   - **PostgreSQL version**: 16 (推荐)
   - **Region**: 选择离你最近的区域

4. 点击 "Create Project"

### Step 2: 获取连接字符串

创建项目后，Neon 会显示连接信息：

```
Connection string:
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/skillhub?sslmode=require
```

**重要**: 
- 复制完整的连接字符串
- 包含 `sslmode=require`（Neon 强制要求 SSL）

### Step 3: 配置环境变量

编辑 `apps/web/.env.local`:

```bash
# Database - Neon (Serverless PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/skillhub?sslmode=require"

# 直接连接 URL（用于 Prisma Migrate）
# 在 Neon Dashboard -> Connection Details -> Pooler 中获取
DIRECT_URL="postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/skillhub?sslmode=require"
```

**注意**: 
- `DATABASE_URL`: 使用连接池（默认）
- `DIRECT_URL`: 使用直连（用于迁移）

### Step 4: 安装 Prisma Adapter for Neon（可选但推荐）

Neon 提供了优化的 Prisma 适配器：

```bash
npm install @neondatabase/serverless
```

更新 `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { neonConfig, Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// 配置 Neon
neonConfig.poolQueryViaFetch = true;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 创建连接池
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 创建 Prisma 适配器
const adapter = new PrismaNeon(pool);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Step 5: 生成 Prisma Client

```bash
npx prisma generate
```

### Step 6: 推送数据库 Schema

有两种方式：

#### 方式 A: 使用 Prisma Migrate（推荐用于开发）

```bash
npx prisma migrate dev --name init
```

这会：
1. 创建迁移文件
2. 应用到数据库
3. 生成 Prisma Client

#### 方式 B: 使用 Prisma DB Push（快速原型）

```bash
npx prisma db push
```

这会：
1. 直接将 Schema 推送到数据库
2. 不创建迁移文件
3. 适合快速迭代

### Step 7: 验证连接

创建一个测试脚本 `test-db.ts`:

```typescript
import { prisma } from './lib/prisma';

async function testConnection() {
  try {
    // 尝试查询用户表
    const users = await prisma.user.findMany();
    console.log('✅ 数据库连接成功!');
    console.log(`当前用户数: ${users.length}`);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

运行测试：

```bash
npx tsx test-db.ts
```

---

## 🌟 Neon 优势

### 1. Serverless 架构
- ✅ 自动扩缩容
- ✅ 按使用量付费
- ✅ 无需管理服务器

### 2. 分支功能
- ✅ 即时创建数据库分支
- ✅ 每个 Git 分支可以有独立的数据库
- ✅ 安全的测试环境

### 3. 自动暂停
- ✅ 空闲时自动暂停（节省成本）
- ✅ 访问时自动唤醒
- ✅ 免费层每月 10GB 存储

### 4. 连接池
- ✅ 内置 PgBouncer
- ✅ 自动管理连接
- ✅ 提高性能

---

## 💰 定价

### Free Tier（免费层）
- **存储**: 10 GB
- **计算**: 0.5 vCPU, 2 GB RAM
- **带宽**: 1 GB/月
- **分支**: 无限
- **适用**: 开发和小型项目

### Pro Tier（专业版）
- **价格**: $0.024/小时（约 $17.52/月）
- **存储**: 100 GB
- **计算**: 1 vCPU, 4 GB RAM
- **带宽**: 100 GB/月
- **适用**: 生产环境

---

## 🔗 有用链接

- **Neon Console**: https://console.neon.tech
- **文档**: https://neon.tech/docs
- **Prisma 集成**: https://neon.tech/docs/guides/prisma
- **GitHub**: https://github.com/neondatabase/neon

---

## ⚠️ 注意事项

### 1. SSL 连接
Neon **强制要求** SSL 连接，确保连接字符串包含 `sslmode=require`。

### 2. 连接池 vs 直连
- **DATABASE_URL**: 使用连接池（适用于查询）
- **DIRECT_URL**: 使用直连（适用于迁移）

### 3. 自动暂停
免费层的数据库在 5 分钟无活动后会暂停，首次访问会有短暂延迟（约 1-2 秒）。

### 4. 地域选择
选择离你的用户最近的地域以减少延迟。

---

## 🚀 快速开始示例

```bash
# 1. 设置环境变量
echo 'DATABASE_URL="your-neon-connection-string"' >> .env.local
echo 'DIRECT_URL="your-neon-direct-connection"' >> .env.local

# 2. 生成 Prisma Client
npx prisma generate

# 3. 推送 Schema
npx prisma db push

# 4. 启动开发服务器
npm run dev
```

---

**最后更新**: 2026-04-16  
**数据库版本**: PostgreSQL 16  
**适配器**: Prisma ORM + Neon

# SkillHub 使用 Neon 云数据库部署指南

## 📋 概述

本指南介绍如何使用 **Neon 云数据库** 部署 SkillHub，无需自建 PostgreSQL 服务器。

### 优势
- ✅ 零数据库维护（自动备份、监控、扩展）
- ✅ 高可用性（99.9% SLA）
- ✅ SSL 加密连接（默认启用）
- ✅ 按量付费（免费层足够开发使用）
- ✅ 全球访问（新加坡节点，亚太低延迟）

---

## 🚀 快速开始

### 1. 准备环境变量

复制模板文件并填写配置：

```bash
cp .env.production.neon .env.production
```

编辑 `.env.production`，修改以下配置：

```env
# Neon 数据库连接字符串（从 deer-flow/.env 复制）
NEON_DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Redis 密码（修改为强密码）
REDIS_PASSWORD=YourStrongRedisPassword2026!

# NextAuth Secret（生成随机字符串）
NEXTAUTH_SECRET=your-random-secret-here

# 生产环境域名
NEXTAUTH_URL=https://your-domain.com
```

### 2. 生成 NextAuth Secret

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

### 3. 运行数据库迁移

在本地执行 Prisma 迁移（首次部署）：

```bash
# 设置临时环境变量
$env:DATABASE_URL = "你的NEON_DATABASE_URL"

# 运行迁移
cd apps/web
npx prisma migrate deploy
npx prisma generate
```

### 4. 启动服务

使用专用的 docker-compose 配置文件：

```bash
# 构建镜像
docker-compose -f docker-compose.neon.yml build

# 启动服务
docker-compose -f docker-compose.neon.yml up -d

# 查看日志
docker-compose -f docker-compose.neon.yml logs -f web
```

---

## 🔧 配置说明

### 服务架构

```
┌─────────────┐
│   Web App   │ (Docker Container)
│  (Port 3000)│
└──────┬──────┘
       │
       ├──► Neon Cloud DB (PostgreSQL)
       │    └─ ep-xxx.ap-southeast-1.aws.neon.tech
       │
       └──► Redis (Local Docker)
            └─ Port 6379
```

### 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|------|---------|---------|------|
| Web | 3000 | 3000 | Next.js 应用 |
| Redis | 6379 | 6379 | 缓存服务 |

---

## 📊 Neon 数据库管理

### 访问 Neon Dashboard

1. 登录 [Neon Console](https://console.neon.tech/)
2. 查看数据库使用情况
3. 管理分支（Branches）
4. 监控性能指标

### 创建数据库分支（可选）

Neon 支持即时创建数据库分支，用于测试：

```env
# 测试环境使用分支数据库
NEON_DATABASE_URL=postgresql://.../neondb-test?sslmode=require
```

### 连接池配置

Neon 自动提供连接池，无需额外配置。Prisma 会自动使用高效的连接管理。

---

## 🔒 安全建议

### 1. 保护敏感信息

```bash
# 确保 .env.production 不被提交
echo ".env.production" >> .gitignore

# 设置文件权限（Linux/Mac）
chmod 600 .env.production
```

### 2. 使用强密码

- Redis 密码：至少 16 位，包含大小写字母、数字、特殊字符
- NextAuth Secret：使用随机生成的 32 字节字符串

### 3. 限制数据库访问

在 Neon Dashboard 中：
- 启用 IP 白名单
- 只允许必要的 IP 地址访问
- 定期轮换密码

---

## 🛠️ 常用命令

### 查看服务状态

```bash
docker-compose -f docker-compose.neon.yml ps
```

### 查看日志

```bash
# 所有服务
docker-compose -f docker-compose.neon.yml logs -f

# 仅 Web 服务
docker-compose -f docker-compose.neon.yml logs -f web

# 仅 Redis
docker-compose -f docker-compose.neon.yml logs -f redis
```

### 重启服务

```bash
docker-compose -f docker-compose.neon.yml restart
```

### 停止服务

```bash
docker-compose -f docker-compose.neon.yml down
```

### 更新应用

```bash
# 重新构建
docker-compose -f docker-compose.neon.yml build --no-cache

# 重新启动
docker-compose -f docker-compose.neon.yml up -d
```

---

## 📈 监控与健康检查

### 健康检查端点

访问 `http://localhost:3000/api/health` 查看服务状态：

```json
{
  "status": "healthy",
  "timestamp": "2026-04-20T14:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 45,
      "error": null
    },
    "redis": {
      "status": "healthy",
      "responseTime": 2,
      "error": null
    },
    "totalResponseTime": 50
  }
}
```

### Neon 监控

在 Neon Dashboard 中监控：
- CPU 使用率
- 内存使用
- 连接数
- 查询性能
- 存储使用

---

## 💰 成本估算

### Neon 免费层

- **存储**: 0.5 GB
- **计算**: 0.25 vCPU, 1 GB RAM
- **带宽**: 1 GB/月
- **适合**: 开发、测试、小型项目

### Neon Pro ($9/月)

- **存储**: 10 GB
- **计算**: 0.5 vCPU, 2 GB RAM
- **带宽**: 10 GB/月
- **适合**: 生产环境

### 额外成本

- **Redis**: 本地运行（免费）或云服务（~$5-15/月）
- **服务器**: VPS 费用（~$5-20/月）

**总计**: ~$14-34/月（取决于配置）

---

## ❓ 常见问题

### Q: Neon 数据库连接慢怎么办？

A: 
1. 检查网络延迟（ping 数据库主机）
2. 确保使用正确的区域（亚太选择新加坡）
3. 检查防火墙规则
4. 考虑使用连接池

### Q: 如何备份数据库？

A: Neon 自动进行每日备份，保留 7 天。也可以手动创建分支作为快照。

### Q: Redis 可以用云服务吗？

A: 可以！推荐使用：
- **Upstash** (免费层可用)
- **Redis Cloud**
- **AWS ElastiCache**

只需修改 `REDIS_URL` 环境变量即可。

### Q: 如何升级数据库版本？

A: Neon 自动管理 PostgreSQL 版本升级，无需手动操作。

---

## 📚 相关文档

- [Neon 官方文档](https://neon.tech/docs)
- [Prisma + Neon 集成](https://neon.tech/docs/guides/prisma)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Docker Compose 参考](https://docs.docker.com/compose/)

---

## 🆘 获取帮助

遇到问题？
1. 查看日志：`docker-compose -f docker-compose.neon.yml logs -f`
2. 检查健康状态：`curl http://localhost:3000/api/health`
3. 查阅 [GitHub Issues](https://github.com/BiglionX/SkillHub/issues)

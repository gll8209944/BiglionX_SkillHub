# SkillHub 生产环境改进 - 快速参考

> **更新日期**: 2026-04-20  
> **状态**: ✅ 已完成高优先级改进

---

## 🎯 核心改进一览

| 改进项 | 状态 | 文件 | 说明 |
|--------|------|------|------|
| 🔴 默认密码修复 | ✅ | docker-compose.yml | 使用环境变量注入强密码 |
| 🔴 安全响应头 | ✅ | middleware.ts | 7 个安全头全部配置 |
| 🔴 API 速率限制 | ✅ | lib/rate-limit.ts | 基于 Redis 的限流 |
| 🔴 健康检查 | ✅ | app/api/health/route.ts | 监控 DB + Redis |
| 🟡 自动备份 | ✅ | scripts/backup-database.sh | 每日自动备份 |
| 🟡 数据恢复 | ✅ | scripts/restore-database.sh | 带验证的恢复流程 |
| 🟢 部署清单 | ✅ | PRODUCTION_DEPLOYMENT_CHECKLIST.md | 完整检查流程 |

---

## ⚡ 5 分钟快速开始

### 1. 生成密钥

```bash
# PostgreSQL 密码
openssl rand -base64 32

# NextAuth Secret
openssl rand -base64 32
```

### 2. 配置环境变量

```bash
cp .env.production.example .env.production
nano .env.production
```

**必须修改的配置**:
```bash
POSTGRES_PASSWORD=<步骤1生成的密码>
NEXTAUTH_SECRET=<步骤1生成的密钥>
GITHUB_CLIENT_ID=<你的 GitHub OAuth Client ID>
GITHUB_CLIENT_SECRET=<你的 GitHub OAuth Client Secret>
NEXTAUTH_URL=https://your-domain.com
```

### 3. 启动服务

```bash
docker-compose up -d
```

### 4. 验证部署

```bash
# 检查服务状态
docker-compose ps

# 测试健康检查
curl http://localhost:3000/api/health

# 查看日志
docker-compose logs -f web
```

### 5. 配置备份（可选但推荐）

```bash
chmod +x scripts/backup-database.sh
crontab -e
# 添加: 0 2 * * * /path/to/scripts/backup-database.sh
```

---

## 🔍 关键验证命令

### 安全检查

```bash
# 1. 验证安全响应头
curl -I http://localhost:3000/api/health | grep -E "X-Frame|X-Content|Strict"

# 2. 测试速率限制
for i in {1..150}; do
  curl -s -o /dev/null -w "%{http_code} " http://localhost:3000/api/skills
done
# 应该看到后面出现 429

# 3. 检查健康检查
curl http://localhost:3000/api/health | jq
```

### 备份测试

```bash
# 手动备份
./scripts/backup-database.sh

# 验证备份
ls -lh /backups/postgres/
gunzip -t /backups/postgres/skillhub_*.sql.gz
```

---

## 📋 生产部署前必做清单

### 🔴 必须完成

- [ ] 修改 `POSTGRES_PASSWORD` 为强密码
- [ ] 生成新的 `NEXTAUTH_SECRET`
- [ ] 配置生产环境的 GitHub OAuth
- [ ] 设置正确的 `NEXTAUTH_URL`（HTTPS）
- [ ] 验证健康检查返回 200
- [ ] 确认安全响应头存在
- [ ] 测试速率限制生效

### 🟡 强烈推荐

- [ ] 配置自动化备份（cron）
- [ ] 测试一次数据恢复
- [ ] 创建数据库索引
- [ ] 配置 SSL 证书
- [ ] 设置防火墙规则

### 🟢 可选优化

- [ ] 集成 Sentry 错误追踪
- [ ] 配置 CDN
- [ ] 设置日志聚合
- [ ] 添加性能监控

---

## 🚨 常见问题

### Q1: Docker 容器启动失败？

```bash
# 查看详细日志
docker-compose logs web

# 常见原因：
# 1. 端口被占用
netstat -tulpn | grep 3000

# 2. 数据库未就绪
docker-compose logs db

# 3. 环境变量错误
docker-compose config
```

### Q2: 健康检查返回 503？

```bash
# 检查具体哪个服务异常
curl http://localhost:3000/api/health | jq '.checks'

# 如果是数据库问题
docker-compose logs db
docker-compose restart db

# 如果是 Redis 问题
docker-compose exec redis redis-cli ping
docker-compose restart redis
```

### Q3: 速率限制太严格？

编辑 `apps/web/lib/rate-limit.ts`，调整配置：

```typescript
const RATE_LIMITS = {
  '/api/skills': { maxRequests: 200, windowMs: 60 * 1000 },  // 提高限制
  // ...
};
```

### Q4: 如何重置速率限制？

```bash
# 清除 Redis 中的速率限制键
docker-compose exec redis redis-cli KEYS "rate_limit:*" | xargs docker-compose exec redis redis-cli DEL
```

---

## 📊 监控指标

### 健康检查端点

```bash
GET /api/health
```

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2026-04-20T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 5
    },
    "redis": {
      "status": "healthy",
      "responseTime": 2
    }
  }
}
```

### 速率限制头

每个 API 响应包含：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2026-04-20T12:01:00.000Z
```

---

## 🔧 维护任务

### 每日

- [ ] 检查备份是否成功
  ```bash
  ls -lh /backups/postgres/ | tail -1
  ```

- [ ] 查看错误日志
  ```bash
  docker-compose logs --since=24h web | grep ERROR
  ```

### 每周

- [ ] 检查磁盘空间
  ```bash
  df -h
  docker system df
  ```

- [ ] 清理旧日志
  ```bash
  docker-compose logs --tail=1000 > logs_$(date +%Y%m%d).txt
  ```

### 每月

- [ ] 测试数据恢复
  ```bash
  # 在测试环境中执行
  ./scripts/restore-database.sh <latest_backup>
  ```

- [ ] 更新依赖
  ```bash
  npm audit fix
  docker-compose pull
  docker-compose up -d
  ```

- [ ] 轮换密钥
  ```bash
  # 生成新密钥并更新
  openssl rand -base64 32
  ```

---

## 📞 紧急联系

### 故障排查顺序

1. **查看日志**
   ```bash
   docker-compose logs -f
   ```

2. **检查健康状态**
   ```bash
   docker-compose ps
   curl http://localhost:3000/api/health
   ```

3. **重启服务**
   ```bash
   docker-compose restart web
   # 或全部重启
   docker-compose down && docker-compose up -d
   ```

4. **恢复数据**（如需要）
   ```bash
   ./scripts/restore-database.sh <backup_file>
   ```

---

## 📚 相关文档

- [完整审计报告](./PRODUCTION_DEPLOYMENT_AUDIT.md)
- [改进详情](./IMPROVEMENTS_COMPLETED.md)
- [部署检查清单](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- [部署指南](./docs/DEPLOYMENT.md)

---

## ✅ 快速核对表

部署前最后确认：

```
□ POSTGRES_PASSWORD 已修改为强密码
□ NEXTAUTH_SECRET 已生成新值
□ GITHUB OAuth 配置正确
□ NEXTAUTH_URL 使用 HTTPS
□ 健康检查返回 200
□ 安全响应头存在
□ 速率限制正常工作
□ 备份脚本测试通过
□ 日志无 ERROR 级别错误
□ 所有功能测试通过
```

全部打勾后即可正式上线！🎉

---

**提示**: 将此文件加入书签，作为日常运维参考。

# SkillHub 生产环境部署检查清单

> **重要**: 在部署到生产环境之前，必须完成以下所有检查项。

---

## 🔴 关键安全检查（必须完成）

### 1. 凭证安全

- [ ] **修改默认数据库密码**
  ```bash
  # 在 .env.production 或 docker-compose.yml 中设置强密码
  POSTGRES_PASSWORD=<生成强密码>
  ```
  
  **生成强密码**:
  ```bash
  openssl rand -base64 32
  ```

- [ ] **生成新的 NEXTAUTH_SECRET**
  ```bash
  openssl rand -base64 32
  ```
  将生成的值填入 `.env.production`

- [ ] **配置生产环境的 OAuth 凭证**
  - [ ] 在 GitHub 创建生产环境的 OAuth App
  - [ ] 更新回调 URL: `https://your-domain.com/api/auth/callback/github`
  - [ ] 将 Client ID 和 Secret 填入环境变量

- [ ] **验证环境变量文件未提交到 Git**
  ```bash
  git check-ignore .env .env.local .env.production
  # 应该返回文件名，表示已被忽略
  ```

### 2. 安全响应头

- [ ] **验证安全头已配置**
  
  测试命令:
  ```bash
  curl -I https://your-domain.com/api/health
  ```
  
  应包含以下响应头:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy: ...`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (仅 HTTPS)

### 3. 速率限制

- [ ] **验证速率限制生效**
  
  测试命令:
  ```bash
  # 快速发送多个请求
  for i in {1..150}; do
    curl -s -o /dev/null -w "%{http_code}" https://your-domain.com/api/skills
    echo ""
  done
  ```
  
  应该在达到限制后返回 `429` 状态码

- [ ] **验证速率限制头存在**
  ```bash
  curl -I https://your-domain.com/api/skills
  ```
  
  应包含:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

### 4. 健康检查

- [ ] **验证健康检查端点**
  ```bash
  curl https://your-domain.com/api/health
  ```
  
  应返回 JSON:
  ```json
  {
    "status": "healthy",
    "timestamp": "...",
    "checks": {
      "database": { "status": "healthy" },
      "redis": { "status": "healthy" }
    }
  }
  ```

- [ ] **验证 Docker 健康检查**
  ```bash
  docker-compose ps
  # 所有服务应显示 healthy
  ```

---

## 🟡 数据保护（强烈推荐）

### 5. 数据库备份

- [ ] **配置自动化备份**
  
  添加 cron 任务:
  ```bash
  crontab -e
  # 每天凌晨 2 点执行备份
  0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/skillhub-backup.log 2>&1
  ```

- [ ] **测试手动备份**
  ```bash
  chmod +x scripts/backup-database.sh
  ./scripts/backup-database.sh
  ```

- [ ] **验证备份文件**
  ```bash
  ls -lh /backups/postgres/
  gunzip -t /backups/postgres/skillhub_*.sql.gz
  ```

- [ ] **测试恢复流程**
  ```bash
  chmod +x scripts/restore-database.sh
  # 在测试环境中测试
  ./scripts/restore-database.sh /backups/postgres/skillhub_YYYYMMDD_HHMMSS.sql.gz
  ```

- [ ] **配置备份监控**
  - [ ] 设置备份失败告警
  - [ ] 定期检查备份文件大小
  - [ ] 每月测试一次恢复流程

### 6. 数据库优化

- [ ] **创建必要的索引**
  ```sql
  -- 连接到数据库
  docker-compose exec db psql -U skillhub -d skillhub
  
  -- 创建索引
  CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
  CREATE INDEX IF NOT EXISTS idx_skills_namespace_id ON skills(namespace_id);
  CREATE INDEX IF NOT EXISTS idx_skills_created_at ON skills(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  ```

- [ ] **分析表统计信息**
  ```sql
  ANALYZE skills;
  ANALYZE users;
  ANALYZE namespaces;
  ```

---

## 🟢 监控与日志（推荐）

### 7. 错误追踪

- [ ] **配置 Sentry（可选但推荐）**
  ```bash
  # 安装 Sentry
  npm install @sentry/nextjs
  
  # 初始化
  npx @sentry/wizard@latest -i nextjs
  ```
  
  在 `.env.production` 中添加:
  ```bash
  SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
  ```

### 8. 日志管理

- [ ] **配置日志轮转**
  
  创建 `/etc/logrotate.d/skillhub`:
  ```
  /var/log/skillhub/*.log {
      daily
      rotate 30
      compress
      delaycompress
      missingok
      notifempty
      create 0644 www-data www-data
  }
  ```

- [ ] **验证日志输出**
  ```bash
  docker-compose logs -f web
  # 确认日志格式正确，包含时间戳和级别
  ```

---

## 🔵 性能优化（可选）

### 9. CDN 配置

- [ ] **配置 CDN（如使用）**
  
  在 `next.config.js` 中添加:
  ```javascript
  images: {
    domains: ['cdn.your-domain.com'],
  }
  ```

### 10. 缓存策略

- [ ] **验证 Redis 缓存工作正常**
  ```bash
  docker-compose exec redis redis-cli ping
  # 应返回 PONG
  ```

- [ ] **监控缓存命中率**
  ```bash
  docker-compose exec redis redis-cli INFO stats | grep keyspace_hits
  ```

---

## 📋 部署前最终检查

### 11. 代码质量

- [ ] **运行所有测试**
  ```bash
  cd apps/web
  npm run test:coverage
  npm run cypress:run
  ```

- [ ] **通过 ESLint 检查**
  ```bash
  npm run lint
  ```

- [ ] **构建成功**
  ```bash
  npm run build
  # 应无错误
  ```

### 12. 环境准备

- [ ] **服务器要求检查**
  - [ ] CPU: 至少 2 核
  - [ ] 内存: 至少 4GB
  - [ ] 磁盘: 至少 20GB 可用空间
  - [ ] Docker 已安装
  - [ ] Docker Compose 已安装

- [ ] **防火墙配置**
  ```bash
  # 仅开放必要端口
  sudo ufw allow 80/tcp   # HTTP
  sudo ufw allow 443/tcp  # HTTPS
  sudo ufw enable
  ```

- [ ] **SSL 证书**
  ```bash
  # 使用 Let's Encrypt
  sudo certbot --nginx -d your-domain.com
  ```

### 13. 部署执行

- [ ] **拉取最新代码**
  ```bash
  git pull origin main
  ```

- [ ] **设置环境变量**
  ```bash
  cp .env.production.example .env.production
  # 编辑 .env.production，填入所有必需的值
  nano .env.production
  ```

- [ ] **启动服务**
  ```bash
  docker-compose up -d
  ```

- [ ] **运行数据库迁移**
  ```bash
  docker-compose exec web npx prisma migrate deploy
  ```

- [ ] **验证部署**
  ```bash
  # 检查服务状态
  docker-compose ps
  
  # 查看日志
  docker-compose logs -f web
  
  # 测试健康检查
  curl http://localhost:3000/api/health
  
  # 访问应用
  open https://your-domain.com
  ```

---

## 🔄 部署后验证

### 14. 功能测试

- [ ] **核心功能测试**
  - [ ] 用户注册/登录
  - [ ] Skills 浏览和搜索
  - [ ] Skill 发布
  - [ ] 命名空间管理
  - [ ] Dashboard 访问

- [ ] **API 测试**
  ```bash
  # 测试主要 API 端点
  curl https://your-domain.com/api/skills
  curl https://your-domain.com/api/search?q=test
  curl https://your-domain.com/api/health
  ```

- [ ] **性能测试**
  ```bash
  # 使用 Apache Bench 进行简单压力测试
  ab -n 1000 -c 10 https://your-domain.com/api/skills
  ```

### 15. 监控设置

- [ ] **设置告警**
  - [ ] 服务宕机告警
  - [ ] 高 CPU/内存使用率告警
  - [ ] 磁盘空间不足告警
  - [ ] 备份失败告警

- [ ] **配置仪表盘**
  - [ ] 服务器资源监控
  - [ ] 应用性能指标
  - [ ] 数据库连接数
  - [ ] API 响应时间

---

## 📝 文档更新

- [ ] **更新运行手册**
  - [ ] 常见故障排查步骤
  - [ ] 紧急联系人列表
  - [ ] 回滚流程

- [ ] **记录配置变更**
  - [ ] 环境变量清单
  - [ ] 第三方服务依赖
  - [ ] 自定义配置说明

---

## ✅ 签署确认

部署负责人: _______________  
日期: _______________  

复核人: _______________  
日期: _______________  

---

**注意**: 
- 🔴 红色项目为必须完成项，否则不得部署
- 🟡 黄色项目为强烈推荐项，应在首次部署后尽快完成
- 🟢 绿色项目为可选项，可根据实际情况决定
- 🔵 蓝色项目为性能优化，建议在生产运行稳定后进行

**最后更新**: 2026-04-20  
**版本**: v1.0

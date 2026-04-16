# Skill Hub 部署指南

## 📋 目录

- [快速开始](#快速开始)
- [Docker 部署](#docker-部署)
- [环境变量配置](#环境变量配置)
- [生产环境部署](#生产环境部署)
- [ClawHub 协议兼容](#clawhub-协议兼容)
- [故障排查](#故障排查)

---

## 🚀 快速开始

### 前置要求

- Docker >= 20.10
- Docker Compose >= 2.0
- Node.js >= 20.12 (本地开发)

### 一键启动

\\\ash
# 克隆仓库
git clone https://github.com/BigLionX/skillhub.git
cd skillhub

# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f web
\\\

访问 http://localhost:3000

---

## 🐳 Docker 部署

### 架构说明

Skill Hub 使用多容器架构：

- **web**: Next.js Web 应用 (端口 3000)
- **db**: PostgreSQL 16 数据库 (端口 5432)
- **redis**: Redis 7 缓存 (端口 6379)

### 配置文件

#### docker-compose.yml

完整的服务编排配置，包括：
- 自动重启策略
- 健康检查
- 数据持久化
- 网络隔离

#### Dockerfile.web

Web 应用的多阶段构建：
1. **builder 阶段**: 安装依赖并构建应用
2. **production 阶段**: 仅包含运行时的最小镜像

### 常用命令

\\\ash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f [service]

# 重启服务
docker-compose restart web

# 进入容器
docker-compose exec web sh

# 查看服务状态
docker-compose ps

# 更新服务
docker-compose pull
docker-compose up -d
\\\

---

## ⚙️ 环境变量配置

### Web 应用环境变量

创建 \.env\ 文件：

\\\env
# 数据库配置
DATABASE_URL=postgresql://skillhub:password@db:5432/skillhub

# Redis 配置
REDIS_URL=redis://redis:6379

# API 配置
SKILLHUB_API_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# OAuth 配置 (可选)
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret

# 存储配置 (可选)
S3_BUCKET=skillhub-storage
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
\\\

### CLI 工具环境变量

\\\env
# API 地址
SKILLHUB_API_URL=https://skillhub.proclaw.cc

# 认证令牌
SKILLHUB_TOKEN=your-api-token
\\\

---

## 🌐 生产环境部署

### 使用反向代理

#### Nginx 配置示例

\\\
ginx
server {
    listen 80;
    server_name skillhub.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_cache_bypass \;
    }
}
\\\

#### Traefik 配置示例

\\\yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - ./traefik.yml:/etc/traefik/traefik.yml

  web:
    labels:
      - "traefik.http.routers.skillhub.rule=Host(\skillhub.yourdomain.com\)"
      - "traefik.http.routers.skillhub.tls=true"
      - "traefik.http.routers.skillhub.tls.certresolver=letsencrypt"
\\\

### HTTPS 配置

使用 Let's Encrypt 获取免费 SSL 证书：

\\\ash
# 使用 certbot
certbot --nginx -d skillhub.yourdomain.com
\\\

### 数据库备份

\\\ash
# 备份数据库
docker-compose exec db pg_dump -U skillhub skillhub > backup.sql

# 恢复数据库
cat backup.sql | docker-compose exec -T db psql -U skillhub skillhub
\\\

---

## 🔗 ClawHub 协议兼容

### 什么是 ClawHub？

ClawHub 是 OpenClaw 等 AI Agent 使用的技能注册协议。Skill Hub 完全兼容此协议。

### 配置 OpenClaw

在 OpenClaw 配置文件中添加：

\\\json
{
  "registry": {
    "url": "https://skillhub.proclaw.cc",
    "protocol": "clawhub"
  }
}
\\\

### API 端点

Skill Hub 提供以下 ClawHub 兼容端点：

- \GET /api/clawhub/search?q={query}\ - 搜索技能
- \GET /api/clawhub/skills/{name}\ - 获取技能详情
- \GET /api/clawhub/skills/{name}/download\ - 下载技能包
- \GET /api/clawhub/manifest.json\ - 获取清单文件

### 使用示例

\\\ash
# OpenClaw 中安装技能
claw skill install smart-replenishment --registry https://skillhub.proclaw.cc

# Claude Code 中配置
claude config set registry https://skillhub.proclaw.cc
\\\

---

## 🔧 故障排查

### 常见问题

#### 1. 容器无法启动

\\\ash
# 查看详细日志
docker-compose logs web

# 检查端口占用
netstat -tulpn | grep 3000

# 重新启动
docker-compose down
docker-compose up -d
\\\

#### 2. 数据库连接失败

\\\ash
# 检查数据库是否运行
docker-compose ps db

# 查看数据库日志
docker-compose logs db

# 测试连接
docker-compose exec db psql -U skillhub -d skillhub
\\\

#### 3. Redis 连接失败

\\\ash
# 检查 Redis 状态
docker-compose exec redis redis-cli ping

# 应该返回: PONG
\\\

#### 4. 内存不足

调整 Docker 资源限制：

\\\yaml
services:
  web:
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M
\\\

### 性能优化

#### 数据库优化

\\\sql
-- 创建索引
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_namespace ON skills(namespace);
CREATE INDEX idx_skills_tags ON skills USING GIN(tags);

-- 分析表
ANALYZE skills;
\\\

#### 缓存优化

确保 Redis 正常运行：

\\\ash
# 检查缓存命中率
docker-compose exec redis redis-cli INFO stats
\\\

---

## 📊 监控和日志

### 健康检查

\\\ash
# 检查所有服务健康状态
curl http://localhost:3000/api/health
\\\

### 日志管理

\\\ash
# 实时查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web

# 导出日志
docker-compose logs web > web.log
\\\

---

## 🔄 更新和升级

### 更新应用

\\\ash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose build
docker-compose up -d
\\\

### 数据库迁移

\\\ash
# 运行数据库迁移
docker-compose exec web npx prisma migrate deploy
\\\

---

## 📞 支持

- **文档**: https://skillhub.proclaw.cc/docs
- **GitHub Issues**: https://github.com/BigLionX/skillhub/issues
- **Email**: hello@skillhub.proclaw.cc

---

**最后更新**: 2026-04-16
**版本**: v1.0.0

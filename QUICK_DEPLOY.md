# Skill Hub - 快速部署指南

## 🚀 5分钟快速启动

### 1. 克隆项目

\\\ash
git clone https://github.com/BigLionX/skillhub.git
cd skillhub
\\\

### 2. 配置环境变量（可选）

\\\ash
cp .env.example .env
# 编辑 .env 文件，修改数据库密码等配置
\\\

### 3. 启动服务

\\\ash
docker-compose up -d
\\\

### 4. 验证部署

\\\ash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f web
\\\

访问 http://localhost:3000

---

## 📝 常用命令

\\\ash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f [service]

# 进入容器
docker-compose exec web sh

# 更新服务
docker-compose pull && docker-compose up -d
\\\

---

## 🔗 ClawHub 集成

### OpenClaw 配置

\\\json
{
  \"registry\": {
    \"url\": \"https://skillhub.proclaw.cc\"
  }
}
\\\

### CLI 使用

\\\ash
# 安装技能
skillhub install smart-replenishment

# 搜索技能
skillhub search inventory

# 发布技能
skillhub publish ./my-skill
\\\

---

## 📚 更多文档

- [完整部署指南](./docs/DEPLOYMENT.md)
- [开发计划](./DEVELOPMENT_PLAN.md)
- [项目总结](./PROJECT_SUMMARY.md)

---

**版本**: v1.0.0
**最后更新**: 2026-04-16

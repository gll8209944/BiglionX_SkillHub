# Skill Hub - AI Agent技能注册中心

> **企业级、可自托管、开源的AI Agent技能管理平台**
> 类似于"AI时代的npm/Docker Hub"，专门为Skills设计

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-planning-yellow.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0--planning-green.svg)]()

---

## 🌟 项目简介

Skill Hub是一个**独立的企业级AI Agent技能注册中心**，可以：

- ✅ **独立部署** - Docker一键部署，不依赖其他系统
- ✅ **完全开源** - Apache 2.0协议，代码完全透明
- ✅ **多Agent支持** - OpenClaw、Claude Code、Cursor等
- ✅ **企业级特性** - 命名空间、审核流程、审计日志
- ✅ **与ProClaw集成** - 可作为ProClaw生态的技能商店

---

## 🚀 快速开始

### Docker部署 (推荐)

```bash
# 克隆仓库
git clone https://github.com/BigLionX/skillhub.git
cd skillhub

# 一键启动
docker-compose up -d

# 访问应用
open http://localhost:3000
```

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

---

## ✨ 核心特性

### 1. 技能管理

- 📦 发布和管理AI Agent技能包
- 🔖 语义化版本控制
- 🏷️ 标签和分类
- 📊 下载统计和评分

### 2. 命名空间系统

- 👤 个人空间 - 个人开发者使用
- 👥 团队空间 - 团队协作开发
- 🌍 全局空间 - 公开共享

### 3. 审核与治理

- 🤖 自动化安全检查
- 👨‍💼 人工审核工作流
- 📝 完整的审计日志
- ⚙️ 可配置的发布策略

### 4. CLI工具

```bash
# 发布技能
skillhub skill publish ./my-skill

# 安装技能
skillhub skill install smart-replenishment

# 搜索技能
skillhub skill search "replenishment"
```

### 5. ClawHub兼容

完全兼容ClawHub协议，OpenClaw等Agent可直接使用：

```bash
# OpenClaw配置
claw config set registry https://skillhub.proclaw.cc
```

---

## 🏗️ 技术架构

```yaml
前端: Next.js 14 + React 18 + TypeScript
UI: MUI 7.x + Tailwind CSS
后端: Next.js API Routes
数据库: PostgreSQL 16
ORM: Prisma
缓存: Redis
存储: S3/MinIO/R2 (可配置)
认证: NextAuth.js
部署: Docker Compose / Kubernetes
```

---

## 📚 文档

- [📖 开发计划](./DEVELOPMENT_PLAN.md) - 完整的10周开发路线图
- [🚀 快速开始](./docs/QUICK_START.md) - 5分钟快速上手
- [📡 API文档](./docs/API_REFERENCE.md) - REST API参考
- [🐳 部署指南](./docs/DEPLOYMENT.md) - Docker和K8s部署
- [🔧 开发指南](./docs/DEVELOPMENT.md) - 本地开发和贡献
- [❓ 常见问题](./docs/FAQ.md) - FAQ

---

## 🎯 使用场景

### 企业内部

在企业内部搭建私有技能市场：

```bash
docker-compose -f docker-compose.enterprise.yml up -d
```

- 数据完全自主
- 符合安全合规要求
- 支持团队协作

### SaaS服务

提供公开的技能市场服务：

- 多租户隔离
- 付费订阅
- SLA保障

### 开源社区

作为开源社区的技能分享平台：

- 完全免费
- 社区驱动
- 开放贡献

---

## 🔗 与ProClaw集成

Skill Hub可以与ProClaw Desktop深度集成：

```typescript
// ProClaw中的Skill Store
import { SkillStore } from '@proclaw/skill-store';

const store = new SkillStore({
  apiUrl: 'https://skillhub.proclaw.cc',
});

const skills = await store.search('inventory');
```

---

## 📊 项目状态

- [x] 项目规划完成
- [ ] 基础设施搭建 (Week 1-2)
- [ ] 核心功能开发 (Week 3-4)
- [ ] 审核系统 (Week 5-6)
- [ ] CLI工具 (Week 7)
- [ ] Docker配置 (Week 8)
- [ ] 开源准备 (Week 9-10)
- [ ] 🚀 v1.0发布

**预计发布时间**: 2026年6月底

---

## 🤝 贡献指南

欢迎贡献！请阅读：

- [贡献指南](./CONTRIBUTING.md)
- [行为准则](./CODE_OF_CONDUCT.md)
- [开发指南](./docs/DEVELOPMENT.md)

### 快速贡献

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 提交Pull Request

---

## 📄 许可证

本项目采用 **Apache License 2.0** - 详见 [LICENSE](LICENSE) 文件

商业使用请联系: hello@skillhub.proclaw.cc

---

## 🙏 致谢

感谢以下项目和团队的启发：

- [iflytek/SkillHub](https://github.com/iflytek/skillhub) - 优秀的设计理念
- [npm](https://www.npmjs.com/) - 包管理的典范
- [Docker Hub](https://hub.docker.com/) - 容器镜像分发

---

## 📞 联系方式

- **Website**: https://skillhub.proclaw.cc
- **Email**: hello@skillhub.proclaw.cc
- **GitHub**: https://github.com/BigLionX/skillhub
- **Discord**: [加入社区](https://discord.gg/skillhub) (待创建)

---

## ⭐ Star History

如果这个项目对您有帮助，请给我们一个Star！

[![Star History Chart](https://api.star-history.com/svg?repos=BigLionX/skillhub&type=Date)](https://star-history.com/#BigLionX/skillhub&Date)

---

**版本**: v1.0.0-planning
**最后更新**: 2026-04-16
**预计发布**: 2026年6月底

---

_Made with ❤️ by BigLionX Team_

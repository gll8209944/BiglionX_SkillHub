# Skill Hub - AI Agent技能注册中心与全球搜索引擎

> **企业级、可自托管、开源的AI Agent技能管理平台 + 全球Skills搜索引擎**
> 类似于"AI时代的npm/Docker Hub"，专门为Skills设计，集成智能爬虫自动发现全球Skills

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-green.svg)]()
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)]()
[![Stars](https://img.shields.io/github/stars/BigLionX/SkillHub?style=social)]()

---

## 🌟 项目简介

Skill Hub是一个**独立的企业级AI Agent技能注册中心 + 全球Skills搜索引擎**，可以：

### 核心功能

- ✅ **独立部署** - Docker一键部署，不依赖其他系统
- ✅ **完全开源** - Apache 2.0协议，代码完全透明
- ✅ **多Agent支持** - OpenClaw、Claude Code、Cursor等
- ✅ **企业级特性** - 命名空间、审核流程、审计日志
- ✅ **与ProClaw集成** - 可作为ProClaw生态的技能商店
- ✨ **Settings 设置系统** - 个人资料、账户安全、通知管理、API密钥
- ✨ **Analytics 数据分析** - 平台统计、趋势图表、数据可视化
- ✨ **现代 UX** - Toast 通知、Skeleton 骨架屏、响应式设计

### 🆕 v2.0 新增：全球Skills搜索引擎

- 🔍 **全面搜索** - 面向全球的数十万个Skills和Agents的搜索引擎
- 🤖 **智能爬虫** - 每天自动更新，发现新的Skills
- 📥 **自动索引** - 将搜索到的Skill索引、说明、下载链接加入SkillHub
- 🌐 **数据聚合** - 整合SkillsMP、Skill Seekers和DeerFlow的数据源
- 🦌 **DeerFlow 2.0** - 字节跳动超级Agent框架，智能调度和编排
- 💡 **解决痛点** - 方便开发和用户，避免被海量Skill信息淹没

---

## 🚀 快速开始

### Docker部署 (推荐)

```bash
# 克隆仓库
git clone https://github.com/BigLionX/SkillHub.git
cd SkillHub

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
- 🔍 技能搜索和过滤
- 🌐 公开技能市场（无需登录）
- ✨ 现代化的Skills市场页面（带导航和登录入口）

### 2. 命名空间系统

- 👤 个人空间 - 个人开发者使用
- 👥 团队空间 - 团队协作开发
- 🌍 全局空间 - 公开共享
- 👥 成员管理 - 角色权限控制

### 3. 用户系统

- 🔐 安全认证 - NextAuth.js + OAuth
- 👤 用户注册和登录
- ⚙️ Settings设置 - 个人资料、头像上传
- 🔑 API密钥管理
- 🔒 账户安全 - 密码修改
- 📧 通知设置

### 4. 审核与治理

- 🤖 自动化安全检查
- 👨‍ 人工审核工作流
- 📝 完整的审计日志
- ⚙️ 可配置的发布策略

### 5. 数据分析

- 📊 平台统计概览
- 📈 趋势图表可视化
- 👤 个人数据分析
- 💫 热门Skills排行
- 🔍 全球Skills搜索统计

### 6. 全球Skills搜索引擎 (v2.0)

- 🔎 **SkillsMP集成** - 集成SkillsMP的搜索后端
- 🕷️ **智能爬虫** - 基于Skill Seekers的爬虫引擎
- 🦌 **DeerFlow 2.0** - 字节跳动SuperAgent编排框架
- ⏰ **定时任务** - 每天自动扫描GitHub上的SKILL.md仓库
- 📚 **自动索引** - 将新技能的索引、说明、下载链接添加到数据库
- 🌍 **全球覆盖** - 支持数十万个Skills的搜索和管理
- 🔄 **智能调度** - 多Agent协作完成复杂发现和更新任务

### 7. 管理后台

- 👨‍ 审核管理系统
- 📝 审计日志查看
- 📊 数据分析面板
- 👥 用户管理

### 8. CLI工具

```bash
# 发布技能
skillhub skill publish ./my-skill

# 安装技能
skillhub skill install smart-replenishment

# 搜索技能
skillhub skill search "replenishment"

# 配置CLI
skillhub config set registry https://skillhub.proclaw.cc
```

### 9. ClawHub兼容

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
- [📡 API文档](./BACKEND_API_IMPLEMENTATION.md) - REST API参考
- [🐳 部署指南](./docs/DEPLOYMENT.md) - Docker和K8s部署
- [🔧 开发指南](./CONTRIBUTING.md) - 本地开发和贡献
- [📊 项目状态](./WEEK9_COMPLETE_FINAL_REPORT.md) - 最新开发报告
- [ 完成度审查](./PROJECT_COMPLETENESS_REVIEW.md) - 功能完整性审查
- [🗺️ 网站地图](./apps/web/SITEMAP_README.md) - SEO和搜索引擎优化

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
- [x] 基础设施搭建 (Week 1-2)
- [x] 核心功能开发 (Week 3-4)
- [x] 审核系统 (Week 5-6)
- [x] CLI工具 (Week 7)
- [x] Docker配置 (Week 8)
- [x] 性能优化与文档 (Week 9)
- [x] 功能完善 (Week 10)
- [x] 🚀 v1.0发布 (Week 11)
- [ ] 全球搜索引擎集成 (Phase 1)
- [ ] SkillsMP集成 (Phase 1)
- [ ] 智能爬虫系统 (Phase 2)
- [ ] Skill Seekers集成 (Phase 2)
- [ ] DeerFlow 2.0集成 (Phase 3)
- [ ] 智能调度流水线 (Phase 3)
- [ ] 🚀 v2.0发布 (待计划)

**当前版本**: v2.0.0-dev  
**发布时间**: 2026年4月18日  
**完成度**: ~95% (v1.0), v2.0规划中

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
- **GitHub**: https://github.com/BigLionX/SkillHub
- **Discord**: [加入社区](https://discord.gg/skillhub) (待创建)

---

## ⭐ Star History

如果这个项目对您有帮助，请给我们一个Star！

[![Star History Chart](https://api.star-history.com/svg?repos=BigLionX/skillhub&type=Date)](https://star-history.com/#BigLionX/skillhub&Date)

---

**版本**: v2.0.0-dev  
**最后更新**: 2026-04-18  
**发布日期**: 2026年4月18日

---

_Made with ❤️ by BigLionX Team_

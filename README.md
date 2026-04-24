# Skill Hub - AI Agent技能注册中心与全球搜索引擎

> **企业级、可自托管、开源的AI Agent技能管理平台 + 全球Skills搜索引擎**
> 类似于"AI时代的npm/Docker Hub"，专门为Skills设计，集成智能爬虫自动发现全球Skills

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-green.svg)]()
[![Version](https://img.shields.io/badge/version-2.0.0--beta-blue.svg)]()
[![Stars](https://img.shields.io/github/stars/BigLionX/SkillHub?style=social)]()
[![Phase](https://img.shields.io/badge/phase-1--2%20complete-brightgreen)](GLOBAL_SKILLS_SEARCH_PLAN_COMPLETION_CHECK.md)
[![Tests](https://img.shields.io/badge/tests-97%20passing-green)](UNIT_TEST_COMPLETION_20260419.md)
[![Coverage](https://img.shields.io/badge/coverage-80.4%25-yellowgreen)](TEST_COVERAGE_REPORT.md)

---

## 🌟 项目简介

Skill Hub是一个**独立的企业级AI Agent技能注册中心 + 全球Skills搜索引擎**，提供两种使用模式：

### 模式一：自主管理平台（核心功能）

用户可以自己创建命名空间、上传和管理 Skills：

- ✅ **独立部署** - Docker一键部署，不依赖其他系统
- ✅ **完全开源** - Apache 2.0协议，代码完全透明
- ✅ **多Agent支持** - OpenClaw、Claude Code、Cursor等
- ✅ **企业级特性** - 命名空间、审核流程、审计日志
- ✅ **与ProClaw集成** - 可作为ProClaw生态的技能商店
- ✨ **Settings 设置系统** - 个人资料、账户安全、通知管理、API密钥
- ✨ **Analytics 数据分析** - 平台统计、趋势图表、数据可视化
- ✨ **现代 UX** - Toast 通知、Skeleton 骨架屏、响应式设计
- 🚀 **我的SkillHub优化计划** - 个人中心功能全面升级（2026 Q2-Q3）

### 模式二：全球搜索引擎（v2.0 Beta）

自动发现和索引全球的 Skills，方便用户浏览和下载：

- 🔍 **全面搜索** - 面向全球的数十万个Skills的搜索引擎
- 🤖 **智能爬虫** - 每天自动更新，发现新的Skills
- 📥 **自动索引** - 将搜索到的Skill元数据加入SkillHub
- 🌐 **数据聚合** - 整合GitHub、SkillsMP等多个数据源
- 💡 **解决痛点** - 避免被海量Skill信息淹没
- ✅ **Phase 1-2 完成** - SkillsMP集成 + GitHub爬虫系统已就绪

> **重要说明**：搜索引擎功能仅用于**数据采集和索引**，不影响用户自主上传和管理自己的 Skills。两种模式可以同时使用，互不干扰。
>
> **🚧 v2.0 开发状态**: 
> - ✅ Phase 1-2已完成（数据接入层 + 爬虫系统）
> - ✅ 单元测试完成（97个测试，100%通过，覆盖率80.4%）
> - 🔄 搜索系统和前端优化进行中
> - 详见 [完成检查报告](GLOBAL_SKILLS_SEARCH_PLAN_COMPLETION_CHECK.md) 和 [测试报告](UNIT_TEST_COMPLETION_20260419.md)

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
- 🎯 **我的SkillHub** - 个人仪表盘、Skills管理、数据分析、社交互动（优化中）

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

### 6. 质量保证 (新增 ✨)

- ✅ **单元测试** - 97个测试用例，100%通过率
- ✅ **高覆盖率** - 代码覆盖率80.4%，超越目标
- ✅ **组件测试** - AdvancedFilterPanel, Pagination, SearchHistory, SkeletonLoader
- ✅ **最佳实践** - 完善的Mock策略和测试文档

### 7. 全球Skills搜索引擎 (v2.0)

> **注意**：此功能仅用于**自动发现和索引**全球 Skills，不影响用户自主上传和管理自己的 Skills。

- 🔎 **SkillsMP集成** - 集成SkillsMP的搜索后端（备用数据源）✅ 已完成
- 🕷️ **智能爬虫** - 基于 GitHub API 的轻量级爬虫引擎 ✅ 已完成
- 🦌 **DeerFlow 2.0** - 字节跳动SuperAgent编排框架（规划中）
- ⏰ **定时任务** - 每天自动扫描GitHub上的SKILL.md仓库 ✅ 已配置
- 📚 **自动索引** - 将新技能的元数据（名称、描述、下载链接等）添加到数据库 ✅ 已实现
- 🌍 **全球覆盖** - 支持数十万个Skills的搜索和管理
- 🔄 **智能调度** - 多Agent协作完成复杂发现和更新任务（规划中）
- 🔌 **AI Agent 集成** - 支持 Flowise、LangChain、Dify 等平台自动发现和调用 Skills ✅ 已完成

#### 工作原理

1. **数据采集** - 通过 GitHub API 搜索相关仓库，获取元数据
2. **数据存储** - 保存技能的基本信息（名称、描述、Star数、下载链接等）
3. **用户浏览** - 用户在 SkillHub 浏览和搜索这些技能
4. **原始下载** - 点击“下载”按钮跳转到原始 GitHub 仓库
5. **独立上传** - 用户可以同时创建自己的命名空间，上传私有 Skills

### 8. 管理后台

- 👨‍ 审核管理系统
- 📝 审计日志查看
- 📊 数据分析面板
- 👥 用户管理

### 9. CLI工具

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

### 10. AI Agent 集成 (Flowise / LangChain / Dify)

SkillHub 提供标准的 **OpenAPI 3.0** 接口，可被 AI Agent 平台自动发现和调用：

#### 自动发现端点
```bash
# OpenAPI 3.0 规范文档
GET https://skillhub.proclaw.cc/api/openapi

# 工具发现接口（面向 LLM）
GET https://skillhub.proclaw.cc/api/tools/discovery
```

#### 可用的 AI 工具

| 工具 ID | 功能 | 端点 |
|---------|------|------|
| `skillhub-search` | 搜索 AI 技能和工具 | `/api/search` |
| `skillhub-get-detail` | 获取技能详细信息 | `/api/skills/{slug}` |
| `skillhub-semantic-search` | 语义搜索技能 | `/api/search/semantic` |
| `skillhub-list-bounties` | 查看悬赏任务 | `/api/bounties` |

#### Flowise 集成步骤

1. **添加自定义工具**：在 Flowise 中选择 "Custom Tool" → "Import from URL"
2. **输入 OpenAPI 地址**：`https://skillhub.proclaw.cc/api/openapi`
3. **自动识别**：Flowise 会自动解析所有可用的 SkillHub API
4. **拖拽使用**：将工具拖入工作流，AI Agent 即可调用

#### 支持的 AI 平台
- ✅ **Flowise** - 可视化 LLM 应用构建器
- ✅ **LangChain** - Python/JS LLM 框架
- ✅ **Dify** - 开源 LLM 应用开发平台
- ✅ **Coze** - 字节跳动 Bot 开发平台

### 11. ClawHub兼容

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
部署: Docker Compose / Kubernetes / Vercel
AI集成: OpenAPI 3.0, Flowise, LangChain, Dify
```

---

## 📚 文档

### 快速开始
- [🚀 快速开始](./docs/QUICK_START.md) - 5分钟快速上手
- [🐳 部署指南](./docs/DEPLOYMENT.md) - Docker和K8s部署
- [🔧 开发指南](./CONTRIBUTING.md) - 本地开发和贡献

### 部署准备
- [🧹 部署前清理指南](./docs/DEPLOYMENT_CLEANUP_GUIDE.md) - **清理临时文件和归档文档**
- [✅ 部署前检查清单](./docs/PRE_DEPLOYMENT_CHECKLIST.md) - **完整的部署验证清单**
- [📝 清理总结](./docs/CLEANUP_SUMMARY.md) - **本次清理工作记录**
- [⚡ 快速参考](./docs/QUICK_CLEANUP_REFERENCE.md) - **一键清理命令**

### 技术文档
- [📖 开发计划](./DEVELOPMENT_PLAN.md) - 完整的10周开发路线图
- [📡 API文档](./BACKEND_API_IMPLEMENTATION.md) - REST API参考
- [ Flowise 集成指南](./FLOWISE_INTEGRATION_GUIDE.md) - **AI Agent 集成教程**
- [📊 项目状态](./WEEK9_COMPLETE_FINAL_REPORT.md) - 最新开发报告
- [🔍 完成度审查](./PROJECT_COMPLETENESS_REVIEW.md) - 功能完整性审查
- [🗺️ 网站地图](./apps/web/SITEMAP_README.md) - SEO和搜索引擎优化
- [🏗️ 双模式架构](./docs/DUAL_MODE_ARCHITECTURE.md) - **详细说明两种使用模式**

### v2.0 全球搜索
- [🔍 v2.0进度](./GLOBAL_SKILLS_SEARCH_PLAN_COMPLETION_CHECK.md) - **v2.0完成情况检查**
- [✅ 测试报告](./UNIT_TEST_COMPLETION_20260419.md) - **单元测试完成报告**
- [🚀 v2.0 Beta更新](./PROJECT_UPDATE_v2.0_BETA.md) - **最新Beta进展 (2026-04-19)**
- [📝 更新总结](./UPDATE_SUMMARY_20260419.md) - **快速更新摘要**

### 我的 SkillHub 优化
- [🎯 优化计划](./docs/MY_SKILLHUB_OPTIMIZATION_PLAN.md) - **个人中心功能全面升级方案**
- [📋 任务清单](./docs/MY_SKILLHUB_DEVELOPMENT_TASKS.md) - **详细的开发任务和里程碑**

---

## 🎯 使用场景

### 模式一：自主管理平台

#### 企业内部

在企业内部搭建私有技能市场：

```bash
docker-compose -f docker-compose.enterprise.yml up -d
```

- 数据完全自主
- 符合安全合规要求
- 支持团队协作

#### SaaS服务

提供公开的技能市场服务：

- 多租户隔离
- 付费订阅
- SLA保障

#### 开源社区

作为开源社区的技能分享平台：

- 完全免费
- 社区驱动
- 开放贡献

### 模式二：全球搜索引擎

#### 开发者发现 Skills

- 🔍 搜索全球数十万个 Skills
- 📊 查看 Star 数、下载量、质量评分
- 🔗 直接跳转到原始 GitHub 仓库下载
- 💬 阅读其他用户的评价和评论

#### 用户浏览和比较

- 🌐 浏览不同分类的 Skills
- ⭐ 按质量评分排序
- 📈 查看热门 Skills 排行榜
- 🔄 自动更新的最新 Skills

#### 两种模式的关系

```
┌─────────────────────────────────────────────┐
│          SkillHub 平台架构                   │
├─────────────────────────────────────────────┤
│                                             │
│  模式一：自主管理（用户上传）                │
│  ├── 创建命名空间                            │
│  ├── 上传 Skill 代码                         │
│  ├── 版本管理                                │
│  └── 权限控制                                │
│                                             │
│  模式二：搜索引擎（自动索引）                │
│  ├── GitHub API 爬取元数据                   │
│  ├── 保存基本信息（名称、描述、链接）        │
│  ├── 不存储代码文件                          │
│  └── 指向原始仓库                            │
│                                             │
│  ✅ 两种模式独立运行，互不影响               │
│  ✅ 用户可以同时使用两种模式                 │
└─────────────────────────────────────────────┘
```

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
- [x] 全球搜索引擎集成 (Phase 1) ✅
- [x] SkillsMP集成 (Phase 1) ✅
- [x] 智能爬虫系统 (Phase 2) ✅
- [x] 单元测试 (97个测试，100%通过) ✅
- [x] **AI Agent 集成 (Flowise / OpenAPI 3.0)** ✅
- [ ] Skill Seekers集成 (Phase 2) ⚠️ 部分完成
- [ ] DeerFlow 2.0集成 (Phase 3)
- [ ] 搜索系统实现 (Phase 5)
- [ ] 前端优化 (Phase 6)
- [ ] 智能调度流水线 (Phase 3)
- [ ] 🚀 v2.0发布 (待计划)

**当前版本**: v2.0.0-beta  
**发布时间**: 2026年4月19日  
**完成度**: ~95% (v1.0), ~30% (v2.0 Beta)
**测试状态**: ✅ 97个单元测试全部通过，覆盖率80.4%

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

**版本**: v2.0.0-beta  
**最后更新**: 2026-04-22  
**发布日期**: 2026年4月19日  
**测试状态**: ✅ 97 tests passing, 80.4% coverage
**最新计划**: 🎯 我的SkillHub优化计划已启动 (2026 Q2-Q3)

---

_Made with ❤️ by BigLionX Team_

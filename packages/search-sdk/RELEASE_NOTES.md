# SkillHub搜索引擎插件 - 发布说明

## 📦 概述

我们很高兴地宣布 **@skillhub/search-sdk** 正式发布！这是一个功能完整的搜索引擎SDK，允许开发者轻松地将SkillHub强大的搜索功能集成到自己的项目中。

## ✨ 核心特性

### 🔍 全文搜索
- 关键词匹配搜索
- 多条件过滤（分类、语言、数据源等）
- 灵活的排序选项
- 分页支持

### 🧠 语义搜索
- 基于向量相似度的智能搜索
- 理解查询意图，不仅是关键词匹配
- 可配置的相似度阈值
- 返回相似度分数

### ⚡ 高级功能
- 搜索建议（自动补全）
- 热门搜索词
- 相关技能推荐
- 健康检查API

### 🎯 开发者体验
- 完整的TypeScript类型定义
- 简洁的API设计
- 详细的文档和示例
- 错误处理机制

## 📁 包结构

```
packages/search-sdk/
├── src/
│   ├── index.ts              # 主入口文件
│   ├── SearchSDK.ts          # 核心SDK类
│   └── types.ts              # TypeScript类型定义
├── examples/
│   ├── basic-search.ts       # 基础搜索示例
│   ├── semantic-search.ts    # 语义搜索示例
│   ├── advanced-search.ts    # 高级搜索示例
│   ├── suggestions.ts        # 搜索建议示例
│   ├── related-skills.ts     # 相关技能示例
│   └── comprehensive.ts      # 综合示例
├── Dockerfile.plugin         # Docker容器化配置
├── docker-compose.plugin.yml # Docker Compose配置
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md                 # 完整文档
├── QUICKSTART.md            # 快速开始指南
├── INTEGRATION_GUIDE.md     # 集成指南
└── RELEASE_NOTES.md         # 本文件
```

## 🚀 快速开始

### 安装

```bash
npm install @skillhub/search-sdk
```

### 使用

```typescript
import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com'
});

// 执行搜索
const results = await sdk.search({
  query: 'python automation',
  page: 1,
  pageSize: 20
});

console.log(`找到 ${results.total} 个结果`);
```

## 📖 文档

- **[README.md](./README.md)** - 完整的API文档和使用说明
- **[QUICKSTART.md](./QUICKSTART.md)** - 5分钟快速集成指南
- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** - 详细的集成指南

## 💡 使用场景

### 1. Web应用
在React、Vue、Angular等前端框架中集成搜索功能，为用户提供流畅的搜索体验。

### 2. CLI工具
为命令行工具添加技能搜索能力，方便开发者快速查找和安装技能。

### 3. 后端服务
在Node.js、Express、FastAPI等服务中作为搜索代理，提供统一的搜索接口。

### 4. 移动应用
在React Native等跨平台框架中使用，为移动应用添加搜索功能。

### 5. 微服务架构
作为独立的微服务部署，通过REST API提供服务。

## 🔧 部署选项

### 选项1: NPM包（推荐）
直接通过npm安装，最简单的方式。

```bash
npm install @skillhub/search-sdk
```

### 选项2: Docker容器
将搜索引擎作为独立容器运行。

```bash
docker pull skillhub/search-plugin:latest
docker run -d -p 3001:3001 skillhub/search-plugin:latest
```

### 选项3: Docker Compose
使用Docker Compose一键部署完整环境。

```bash
docker-compose -f docker-compose.plugin.yml up -d
```

### 选项4: Kubernetes
在Kubernetes集群中部署，支持高可用和自动扩缩容。

参考 `INTEGRATION_GUIDE.md` 中的Kubernetes配置示例。

## 🎓 示例代码

我们提供了6个完整的示例，涵盖所有主要功能：

```bash
# 运行示例
npx ts-node examples/basic-search.ts
npx ts-node examples/semantic-search.ts
npx ts-node examples/advanced-search.ts
npx ts-node examples/suggestions.ts
npx ts-node examples/related-skills.ts
npx ts-node examples/comprehensive.ts
```

## 🔗 API端点

SDK封装了以下API端点：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/search` | GET | 全文搜索 |
| `/search` | POST | 高级搜索 |
| `/search/semantic` | GET | 语义搜索 |
| `/search/suggestions` | GET | 搜索建议 |
| `/search/popular` | GET | 热门搜索 |
| `/skills/:id/related` | GET | 相关技能 |
| `/health` | GET | 健康检查 |

## 📊 性能特点

- **轻量级**: 仅依赖axios，包体积小
- **高性能**: 内置请求优化和错误重试
- **类型安全**: 完整的TypeScript类型定义
- **可扩展**: 支持自定义请求头和超时设置

## 🛠️ 技术栈

- **语言**: TypeScript 5.0+
- **HTTP客户端**: Axios 1.6+
- **构建工具**: tsup
- **测试**: （待添加）
- **文档**: Markdown

## 🤝 与SkillHub生态集成

此SDK与SkillHub生态系统无缝集成：

- ✅ 兼容SkillHub Web应用
- ✅ 兼容SkillHub CLI工具
- ✅ 支持自托管实例
- ✅ 支持云端API

## 📈 未来计划

- [ ] 添加单元测试
- [ ] 添加集成测试
- [ ] 支持批量操作
- [ ] 添加缓存层
- [ ] 支持WebSocket实时更新
- [ ] 添加监控和指标
- [ ] 支持更多编程语言（Python、Go等）

## 🐛 已知限制

1. 需要连接到运行的SkillHub API实例
2. 语义搜索需要后端支持向量数据库
3. 当前仅支持JavaScript/TypeScript

## 📝 许可证

MIT License - 您可以自由使用、修改和分发此SDK。

## 🙏 致谢

感谢所有为SkillHub项目做出贡献的开发者和用户！

## 📞 支持与反馈

- 🐛 **报告问题**: [GitHub Issues](https://github.com/skillhub/skillhub/issues)
- 💬 **社区讨论**: [Discord](https://discord.gg/skillhub)
- 📧 **邮件支持**: support@skillhub.com
- 📖 **文档**: 查看本目录下的文档文件

## 🎉 开始使用

现在就开始在您的项目中使用SkillHub搜索引擎SDK吧！

```bash
npm install @skillhub/search-sdk
```

查看 [QUICKSTART.md](./QUICKSTART.md) 开始您的集成之旅！

---

**版本**: 1.0.0  
**发布日期**: 2024-01-XX  
**维护者**: SkillHub Team

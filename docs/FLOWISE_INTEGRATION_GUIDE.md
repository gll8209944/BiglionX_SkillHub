# Flowise 集成指南

> **最后更新**: 2026-04-24  
> **版本**: v2.0.0-beta

---

## 📖 概述

SkillHub 提供标准的 **OpenAPI 3.0** 接口，可以被 AI Agent 平台（如 Flowise、LangChain、Dify 等）自动发现和调用，将 SkillHub 的技能搜索和管理功能集成到 AI 工作流中。

---

## 🚀 快速开始

### 1. 在 Flowise 中集成

#### 步骤 1: 添加自定义工具

1. 打开 Flowise 项目
2. 点击左侧工具栏的 **"Custom Tool"**
3. 选择 **"Import from URL"**

#### 步骤 2: 输入 OpenAPI 地址

```
https://skillhub.proclaw.cc/api/openapi
```

或使用本地开发环境：

```
http://localhost:3000/api/openapi
```

#### 步骤 3: 自动识别

Flowise 会自动解析 OpenAPI 文档，识别所有可用的 SkillHub API：

- ✅ `searchSkills` - 搜索技能
- ✅ `getSkillBySlug` - 获取技能详情
- ✅ `semanticSearch` - 语义搜索
- ✅ `listBounties` - 获取悬赏列表

#### 步骤 4: 拖拽使用

将识别出的工具拖入工作流，配置参数后即可使用。

---

## 🔌 可用 API 端点

### 工具发现接口

```bash
GET https://skillhub.proclaw.cc/api/tools/discovery
```

返回简化的工具列表，面向 LLM 优化：

```json
{
  "platform": "SkillHub",
  "version": "1.0.0",
  "tools": [
    {
      "id": "skillhub-search",
      "name": "Search Skills",
      "description": "在 SkillHub 中搜索 AI 技能、工具和库",
      "endpoint": "/api/search",
      "method": "GET",
      "parameters": [...]
    }
  ]
}
```

### OpenAPI 3.0 规范

```bash
GET https://skillhub.proclaw.cc/api/openapi
```

返回完整的 OpenAPI 3.0 规范文档，包含：

- API 路径和参数定义
- 请求/响应 Schema
- 认证方式说明
- 示例数据

---

## 🛠️ 可用的 AI 工具

| 工具 ID | 功能 | 端点 | 方法 |
|---------|------|------|------|
| `skillhub-search` | 搜索 AI 技能和工具 | `/api/search` | GET |
| `skillhub-get-detail` | 获取技能详细信息 | `/api/skills/{slug}` | GET |
| `skillhub-semantic-search` | 语义搜索技能 | `/api/search/semantic` | GET |
| `skillhub-list-bounties` | 查看悬赏任务 | `/api/bounties` | GET |

---

## 📋 API 使用示例

### 1. 搜索技能

**请求**:
```bash
curl "https://skillhub.proclaw.cc/api/search?q=web+scraping&category=crawler"
```

**响应**:
```json
{
  "skills": [
    {
      "id": "abc123",
      "name": "WebScraper",
      "slug": "webscraper",
      "description": "高效的网页爬虫工具",
      "category": "crawler",
      "tags": ["python", "scraping"],
      "author": {
        "name": "张三"
      }
    }
  ],
  "total": 26
}
```

### 2. 获取技能详情

**请求**:
```bash
curl "https://skillhub.proclaw.cc/api/skills/webscraper"
```

**响应**:
```json
{
  "id": "abc123",
  "name": "WebScraper",
  "slug": "webscraper",
  "description": "高效的网页爬虫工具",
  "repositoryUrl": "https://github.com/example/webscraper",
  "versions": [...],
  "author": {...}
}
```

### 3. 语义搜索

**请求**:
```bash
curl "https://skillhub.proclaw.cc/api/search/semantic?q=如何爬取网页数据"
```

**响应**:
```json
{
  "results": [...],
  "query": "如何爬取网页数据",
  "total": 15
}
```

---

## 🤖 支持的 AI 平台

### ✅ 已测试平台

| 平台 | 类型 | 集成方式 | 状态 |
|------|------|----------|------|
| **Flowise** | 可视化 LLM 应用构建器 | OpenAPI 导入 | ✅ 已完成 |
| **LangChain** | Python/JS LLM 框架 | OpenAPI 加载器 | ✅ 支持 |
| **Dify** | 开源 LLM 应用开发平台 | API 工具集成 | ✅ 支持 |
| **Coze** | 字节跳动 Bot 开发平台 | HTTP 请求节点 | ✅ 支持 |

### LangChain 集成示例 (Python)

```python
from langchain.tools import OpenAPIToolkit
from langchain.openapi.connectors.requests import RequestsConnector

# 加载 SkillHub OpenAPI 规范
connector = RequestsConnector(
    base_url="https://skillhub.proclaw.cc",
    headers={"Content-Type": "application/json"}
)

toolkit = OpenAPIToolkit.from_single_file(
    "https://skillhub.proclaw.cc/api/openapi",
    connector=connector
)

# 在 Agent 中使用
from langchain.agents import initialize_agent

agent = initialize_agent(
    tools=toolkit.get_tools(),
    llm=your_llm,
    agent="zero-shot-react-description"
)

# 调用示例
result = agent.run("帮我搜索网页爬虫相关的技能")
```

---

## ⚙️ 配置选项

### 环境变量

在 Vercel 或本地环境中配置：

```bash
# 应用基础 URL（影响 OpenAPI 文档中的服务器地址）
NEXT_PUBLIC_APP_URL=https://skillhub.proclaw.cc

# 禁用调度器（可选，避免启动延迟）
DISABLE_SCHEDULER=true
```

### 缓存配置

OpenAPI 端点内置 **5 分钟内存缓存**，可通过以下方式调整：

```typescript
// apps/web/app/api/openapi/route.ts
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
```

---

## 🔒 安全与限制

### 当前状态

- ✅ **公开 API** - 搜索和浏览功能无需认证
- 🚧 **写操作** - 创建悬赏等功能需要 API 密钥（规划中）
- 🔐 **敏感数据** - 用户信息和私有技能受认证保护

### 速率限制

建议使用合理的请求频率，避免触发平台保护机制：

- 搜索 API: 建议 ≤ 10 次/秒
- 详情 API: 建议 ≤ 20 次/秒

---

## 📚 相关文档

- [主 README](../README.md) - 项目概览
- [API 文档](./BACKEND_API_IMPLEMENTATION.md) - 完整 API 参考
- [双模式架构](./DUAL_MODE_ARCHITECTURE.md) - 平台架构说明
- [部署指南](./DEPLOYMENT.md) - 自托管部署

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进集成体验！

- **Bug 报告**: [GitHub Issues](https://github.com/BiglionX/SkillHub/issues)
- **功能建议**: [Feature Requests](https://github.com/BiglionX/SkillHub/discussions)

---

## 📞 技术支持

- **Email**: hello@skillhub.proclaw.cc
- **GitHub**: https://github.com/BiglionX/SkillHub
- **Website**: https://skillhub.proclaw.cc

---

**Made with ❤️ by BigLionX Team**

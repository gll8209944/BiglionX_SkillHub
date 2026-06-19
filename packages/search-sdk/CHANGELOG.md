# @skillhub/search-sdk 更新日志

## [1.0.0] - 2024-01-15

### 初始发布

#### ✨ 新功能

- **全文搜索** - 支持关键词、分类、标签等多维度搜索
- **语义搜索** - 基于向量相似度的智能语义搜索
- **高级搜索** - 多条件组合搜索（多分类、多语言、多数据源）
- **搜索建议** - 自动补全功能，支持 skill/category/tag 三种类型
- **热门搜索词** - 基于高频词统计的热门搜索推荐
- **相关技能推荐** - 基于 embedding 相似度的技能推荐
- **健康检查** - API 连接健康状态检测

#### 🧩 架构

- 采用 `tsup` 构建，同时输出 CJS 和 ESM 格式
- 完整的 TypeScript 类型定义（`dist/index.d.ts` + `dist/index.d.mts`）
- 零内部依赖（仅 `axios` 作为 HTTP 客户端）

#### 📦 分发包

- npm 包 `@skillhub/search-sdk`，public 权限
- Docker 容器化支持（`Dockerfile.plugin` + `docker-compose.plugin.yml`）
- 示例代码 6 个（basic / semantic / advanced / suggestions / related-skills / comprehensive）

#### 📖 文档

- README.md - 完整 API 文档
- QUICKSTART.md - 5 分钟快速集成指南
- INTEGRATION_GUIDE.md - 多场景集成指南
- RELEASE_NOTES.md - 发布说明

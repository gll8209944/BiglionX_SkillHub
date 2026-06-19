# @skillhub/search-sdk

SkillHub搜索引擎SDK - 为您的应用集成强大的AI技能搜索功能

## 📦 安装

```bash
npm install @skillhub/search-sdk
# 或
yarn add @skillhub/search-sdk
# 或
pnpm add @skillhub/search-sdk
```

## ✨ 特性

- 🔍 **全文搜索** - 支持关键词、分类、标签等多维度搜索
- 🧠 **语义搜索** - 基于向量相似度的智能语义搜索
- ⚡ **高性能** - 内置缓存和批量优化
- 🎯 **类型安全** - 完整的TypeScript类型定义
- 📦 **轻量级** - 仅依赖axios
- 🔌 **易于集成** - 简单的API设计，几分钟即可集成

## 🚀 快速开始

```typescript
import { SearchSDK } from '@skillhub/search-sdk';

// 初始化
const sdk = new SearchSDK({
  apiUrl: 'https://your-skillhub-instance.com/api'
});

// 搜索
const results = await sdk.search({
  query: 'python automation',
  page: 1,
  pageSize: 20
});

console.log(`找到 ${results.total} 个结果`);
```

## 📚 文档

- [快速开始指南](./QUICKSTART.md) - 5分钟快速集成
- [完整文档](./README.md) - 详细的API参考和使用示例
- [示例代码](./examples/) - 各种使用场景的示例

## 💡 使用场景

### Web应用
在React、Vue、Angular等前端框架中集成搜索功能

### CLI工具
为命令行工具添加技能搜索能力

### 后端服务
在Node.js、Express等服务中作为搜索代理

### 移动应用
在React Native等跨平台框架中使用

## 🔗 相关链接

- 🏠 [SkillHub主页](https://github.com/skillhub/skillhub)
- 📖 [部署文档](../../docs/DEPLOYMENT.md)
- 🐛 [问题反馈](https://github.com/skillhub/skillhub/issues)
- 💬 [社区讨论](https://discord.gg/skillhub)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 🙏 致谢

感谢所有为SkillHub项目做出贡献的开发者！

# Contributing to Skill Hub

首先，感谢你考虑为 Skill Hub 做出贡献！🎉

Skill Hub 是一个开源项目，我们欢迎任何形式的贡献，包括：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🌍 翻译本地化

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [报告 Bug](#报告-bug)
  - [提出功能建议](#提出功能建议)
  - [提交代码](#提交代码)
- [开发环境设置](#开发环境设置)
- [代码规范](#代码规范)
- [Pull Request 流程](#pull-request-流程)
- [社区](#社区)

## 行为准则

本项目采用 [Contributor Covenant 行为准则](CODE_OF_CONDUCT.md)。参与即表示你同意遵守此准则。请尊重所有参与者。

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请创建一个 Issue 并包含以下信息：

1. **清晰的标题**：简明扼要地描述问题
2. **复现步骤**：详细说明如何复现该问题
3. **预期行为**：你期望发生什么
4. **实际行为**：实际发生了什么
5. **环境信息**：
   - 操作系统及版本
   - Node.js 版本
   - 浏览器及版本（如果是前端问题）
6. **相关日志**：错误信息或堆栈跟踪

### 提出功能建议

我们欢迎新功能建议！请创建一个 Issue 并说明：

1. **功能描述**：你想要添加什么功能
2. **使用场景**：为什么需要这个功能
3. **实现思路**：如果你有想法，可以分享你的实现方案
4. **替代方案**：是否考虑过其他解决方案

### 提交代码

#### 1. Fork 仓库

点击 GitHub 页面右上角的 "Fork" 按钮

#### 2. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/skillhub.git
cd skillhub
```

#### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

分支命名规范：
- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `refactor/xxx` - 代码重构
- `test/xxx` - 测试相关

#### 4. 进行修改

请确保：
- 代码符合项目的代码规范
- 添加必要的测试
- 更新相关文档
- 提交信息清晰明了

#### 5. 提交更改

```bash
git add .
git commit -m "feat: add new feature description"
```

提交信息规范（遵循 [Conventional Commits](https://www.conventionalcommits.org/)）：

- `feat:` - 新功能
- `fix:` - Bug 修复
- `docs:` - 文档更新
- `style:` - 代码格式（不影响功能）
- `refactor:` - 代码重构
- `test:` - 测试相关
- `chore:` - 构建过程或辅助工具变动

#### 6. 推送到你的 Fork

```bash
git push origin feature/your-feature-name
```

#### 7. 创建 Pull Request

在 GitHub 上创建 Pull Request，请包含：

- 清晰的标题和描述
- 关联的 Issue（如果有）
- 修改内容的说明
- 测试情况说明

## 开发环境设置

### 前置要求

- Node.js >= 18.x
- npm >= 9.x 或 pnpm >= 8.x
- Docker & Docker Compose（用于本地部署测试）

### 安装依赖

```bash
npm install
```

### 配置环境变量

```bash
cp .env.example .env.local
# 编辑 .env.local 填入你的配置
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 运行测试

```bash
npm test
```

## 代码规范

### TypeScript

- 使用 TypeScript 编写所有新代码
- 避免使用 `any` 类型，除非绝对必要
- 为函数和复杂类型添加接口定义

### 代码风格

项目使用 ESLint 和 Prettier 进行代码格式化：

```bash
# 检查代码
npm run lint

# 自动修复
npm run lint:fix
```

### 注释规范

- 使用中文注释业务逻辑
- 使用英文注释技术实现细节
- 为公共 API 添加 JSDoc 注释

### 文件组织

```
src/
├── components/    # React 组件
├── pages/         # Next.js 页面
├── api/           # API 路由
├── lib/           # 工具库
├── types/         # TypeScript 类型定义
└── styles/        # 样式文件
```

## Pull Request 流程

1. **确保通过 CI**：所有测试必须通过
2. **代码审查**：至少需要一位维护者审查
3. **解决反馈**：根据审查意见修改代码
4. **合并**：维护者会将你的 PR 合并到主分支

### PR 检查清单

在提交 PR 前，请确认：

- [ ] 代码遵循项目规范
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 提交信息清晰
- [ ] 没有合并冲突
- [ ] 通过了所有 CI 检查

## 社区

- **Website**: https://skillhub.proclaw.cc
- **Email**: hello@skillhub.proclaw.cc
- **GitHub Discussions**: 讨论功能和想法
- **GitHub Issues**: 报告问题和提出建议

## 许可证

通过贡献代码，你同意你的贡献将根据 Apache 2.0 许可证发布。

---

再次感谢你的贡献！🙏

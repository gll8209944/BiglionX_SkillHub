# 贡献指南 (Contributing to Skill Hub)

感谢你考虑为 **Skill Hub** 做出贡献！在提交你的贡献之前，请花点时间阅读以下指南。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [提交 Pull Request](#提交-pull-request)
- [代码规范](#代码规范)
- [报告 Bug](#报告-bug)
- [功能建议](#功能建议)

---

## 行为准则

本项目采用 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则。通过参与，你同意遵守其条款。

---

## 如何贡献

### 1. Fork 仓库
点击 GitHub 页面右上角的 "Fork" 按钮。

### 2. 克隆你的 Fork
```bash
git clone https://github.com/你的用户名/skillhub.git
cd skillhub
```

### 3. 添加上游远程仓库
```bash
git remote add upstream https://github.com/BigLionX/SkillHub.git
```

### 4. 创建特性分支
```bash
git checkout -b feature/your-feature-name
```

### 5. 进行更改并测试
确保你的更改不会破坏现有功能，并尽可能添加测试。

### 6. 提交更改
```bash
git add .
git commit -m "feat: 添加新功能描述"
```

### 7. 推送到你的 Fork
```bash
git push origin feature/your-feature-name
```

### 8. 提交 Pull Request
在 GitHub 上打开你的 Fork，点击 "Compare & pull request"。

---

## 开发环境设置

### 前置要求

- Node.js 18+ 
- npm 9+
- PostgreSQL 16+
- Docker & Docker Compose (可选，用于容器化部署)

### 本地安装

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **配置环境变量**:
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 填入你的数据库 URL 和认证密钥
   ```

3. **初始化数据库**:
   ```bash
   npx prisma db push
   ```

4. **启动开发服务器**:
   ```bash
   npm run dev
   ```

---

## 提交 Pull Request

在提交 PR 之前，请确保：

- [ ] 代码遵循项目的代码规范
- [ ] 已运行 `npm run lint` 且无错误
- [ ] 已运行 `npm run build` 且构建成功
- [ ] 添加了必要的测试（如果适用）
- [ ] 更新了相关文档（如果适用）
- [ ] PR 标题清晰描述了更改内容

### PR 标题规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

---

## 代码规范

### TypeScript
- 使用 TypeScript 编写所有新代码
- 避免使用 `any` 类型，除非绝对必要
- 为函数和变量使用有意义的名称

### React
- 优先使用函数组件和 Hooks
- 将组件拆分为小的、可复用的单元
- 使用 `React.memo` 优化性能（如果需要）

### CSS/Tailwind
- 使用 Tailwind CSS 类名
- 避免编写自定义 CSS，除非 Tailwind 无法满足需求
- 保持类名顺序一致（可以使用 Prettier 插件）

---

## 报告 Bug

如果你发现了 Bug，请创建一个 Issue 并包含：

1. **清晰的标题和描述**
2. **重现步骤**
3. **预期行为与实际行为**
4. **截图或录屏**（如果适用）
5. **环境信息**（操作系统、浏览器、Node.js 版本等）

---

## 功能建议

我们欢迎新的功能建议！请创建一个 Issue 并标记为 `enhancement`，描述：

1. **功能概述**
2. **为什么需要这个功能**
3. **可能的实现方案**（如果你有想法）

---

## 许可证

通过贡献代码，你同意你的贡献将根据本项目的 [Apache 2.0 许可证](LICENSE) 进行分发。

---

感谢你的贡献！🚀

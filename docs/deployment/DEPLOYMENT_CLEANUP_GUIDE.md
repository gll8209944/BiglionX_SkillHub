# 部署前清理指南

本文档说明在部署到生产环境前需要清理的文件和注意事项。

## 🗑️ 需要删除的临时文件

### 1. 根目录临时文件

```bash
# 测试脚本（已完成的临时脚本）
rm -f check-user.js
rm -f reset-password.js

# 重复的 Logo 文件（保留 skillhub.png 和 logo.png）
rm -f logo.jpeg
rm -f logo2.png
rm -f favcion.png  # 拼写错误，应该是 favicon

# 图片文件（如果不需要可以删除）
rm -f 3fd35a3ffd8fbb96f250fac4afccf612.jpg
```

### 2. apps/web 目录临时文件

```bash
cd apps/web

# 临时检查脚本
rm -f check-skills.js
rm -f check-status.js

# PowerShell 脚本（仅用于本地开发）
rm -f clean-cache.ps1
rm -f restart-dev.ps1

# TypeScript 构建缓存
rm -f tsconfig.tsbuildinfo

# 空的 docs 目录
rmdir docs 2>/dev/null || true
```

### 3. 清理构建产物

```bash
# 清理 Next.js 构建缓存
rm -rf apps/web/.next
rm -rf apps/web/.swc

# 清理 Turbo 缓存
rm -rf .turbo/cache

# 清理 node_modules（可选，CI/CD 会重新安装）
# rm -rf node_modules
# rm -rf apps/web/node_modules
# rm -rf apps/cli/node_modules
```

## 📝 需要整理的文档

### 1. 归档开发文档

将以下开发过程中的文档移动到 `docs/archive/` 目录：

**已完成的功能文档（可以保留但标记为已实现）：**
- ✅ `PASSWORD_LOGIN_FINAL_FIX.md` - 密码登录修复（已实现）
- ✅ `PASSWORD_LOGIN_FIX.md` - 密码登录修复（已实现）
- ✅ `AUTH_PAGES_LOGO_IMPROVEMENT.md` - 认证页面优化（已完成）
- ✅ `LOGOUT_REDIRECT_STRATEGY.md` - 登出重定向策略（已实现）
- ✅ `WIDGET_*` 系列文档 - Widget 功能（已实现）

**计划和设计文档（可以归档）：**
- 📦 `MY_SKILLHUB_*` 系列文档 - 开发计划和进度（已完成，可归档）
- 📦 `SKILLHUB_DEVELOPMENT_PLAN_V2.md` - 开发计划 V2
- 📦 `SKILLHUB_PLAN_COMPARISON.md` - 计划对比
- 📦 `COMMUNITY_BUILDING_PLAN.md` - 社区建设计划
- 📦 `COMMUNITY_FEATURES_PROGRESS.md` - 社区功能进度

**临时调试文档：**
- 📦 `GIT_PUSH_SUMMARY_20260422.md` - Git 推送总结（临时）
- 📦 `LOGO_IMAGE_UPDATE.md` - Logo 更新（已完成）
- 📦 `PROMO_CARDS_OPTIMIZATION.md` - 推广卡片优化（已完成）

### 2. 保留的核心文档

以下文档应该保留在主 `docs/` 目录：

**部署和配置：**
- ✅ `DEPLOYMENT.md` - 部署指南
- ✅ `DEERFLOW_INTEGRATION_GUIDE.md` - DeerFlow 集成指南

**架构和设计：**
- ✅ `DUAL_MODE_ARCHITECTURE.md` - 双模式架构
- ✅ `GLOBAL_SEARCH_ARCHITECTURE.md` - 全局搜索架构
- ✅ `FRONTEND_INTEGRATION_GUIDE.md` - 前端集成指南

**功能文档：**
- ✅ `BOUNTY_SYSTEM_GUIDE.md` - 赏金系统指南
- ✅ `SKILLSMP_INTEGRATION_GUIDE.md` - SkillsMP 集成
- ✅ `SKILL_SEEKERS_CRAWLER_GUIDE.md` - 爬虫指南
- ✅ `GLOBAL_SKILLS_SEARCH_PLAN.md` - 全局搜索计划

**项目信息：**
- ✅ `README.md` - 文档索引
- ✅ `SKILLHUB_OPEN_SOURCE_REVIEW.md` - 开源审查

### 3. 执行归档

```bash
# 创建归档目录
mkdir -p docs/archive/2024-development
mkdir -p docs/archive/completed-features
mkdir -p docs/archive/planning

# 移动开发进度文档
mv docs/MY_SKILLHUB_*.md docs/archive/2024-development/

# 移动已完成的功能文档
mv docs/PASSWORD_LOGIN_*.md docs/archive/completed-features/
mv docs/AUTH_PAGES_LOGO_IMPROVEMENT.md docs/archive/completed-features/
mv docs/LOGOUT_REDIRECT_STRATEGY.md docs/archive/completed-features/
mv docs/WIDGET_*.md docs/archive/completed-features/
mv docs/PROMO_CARDS_OPTIMIZATION.md docs/archive/completed-features/
mv docs/LOGO_IMAGE_UPDATE.md docs/archive/completed-features/

# 移动计划文档
mv docs/SKILLHUB_DEVELOPMENT_PLAN_V2.md docs/archive/planning/
mv docs/SKILLHUB_PLAN_COMPARISON.md docs/archive/planning/
mv docs/COMMUNITY_*.md docs/archive/planning/

# 移动临时文档
mv docs/GIT_PUSH_SUMMARY_*.md docs/archive/
```

## 🔐 敏感信息清理

### 1. 检查环境变量文件

确保以下文件**不**包含真实的密钥：

```bash
# 检查 .env.local（不应该提交到 Git）
cat apps/web/.env.local

# 检查 .env.production（应该使用示例文件）
cat .env.production

# 确保有示例文件
ls -la .env.production.example
ls -la .env.vercel.example
ls -la apps/web/.env.example
```

### 2. 验证 .gitignore

确保 `.gitignore` 包含：

```gitignore
# 环境变量
.env
.env.local
.env.production.local
.env.*.local

# 构建产物
.next/
out/
build/
dist/

# 依赖
node_modules/

# 缓存
.turbo/
*.tsbuildinfo

# 测试
coverage/
.nyc_output/

# IDE
.vscode/settings.json
.idea/

# 操作系统
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*
```

### 3. 检查是否有硬编码的密钥

```bash
# 搜索可能的硬编码密钥
grep -r "sk_live_" --include="*.ts" --include="*.tsx" --include="*.js" apps/
grep -r "ghp_" --include="*.ts" --include="*.tsx" --include="*.js" apps/
grep -r "re_" --include="*.ts" --include="*.tsx" --include="*.js" apps/
```

## 🧪 测试相关清理

### 1. Cypress 测试数据

```bash
# 清理测试截图（保留用于调试）
# rm -rf apps/web/cypress/screenshots/*

# 清理测试视频（如果启用）
# rm -rf apps/web/cypress/videos/*
```

### 2. Jest 测试缓存

```bash
# 清理 Jest 缓存
rm -rf apps/web/node_modules/.cache/jest
```

## 📦 依赖检查

### 1. 检查未使用的依赖

```bash
# 安装 depcheck
npm install -g depcheck

# 检查根目录
depcheck

# 检查 web app
cd apps/web
depcheck

# 检查 cli app
cd ../cli
depcheck
```

### 2. 更新依赖（可选）

```bash
# 检查过时依赖
npm outdated

# 更新依赖（谨慎操作）
# npm update
```

## ✅ 部署前检查清单

### 代码质量

- [ ] 运行 ESLint 检查
  ```bash
  npm run lint
  ```

- [ ] 运行 TypeScript 类型检查
  ```bash
  cd apps/web
  npx tsc --noEmit
  ```

- [ ] 运行测试
  ```bash
  npm test
  npm run cypress:run
  ```

### 构建验证

- [ ] 清理构建缓存
  ```bash
  rm -rf apps/web/.next
  ```

- [ ] 执行生产构建
  ```bash
  cd apps/web
  npm run build
  ```

- [ ] 验证构建产物
  ```bash
  ls -la apps/web/.next
  ```

### 环境配置

- [ ] 确认所有必需的环境变量已配置
- [ ] 确认 `.env.production` 或平台特定配置文件正确
- [ ] 确认数据库连接字符串正确
- [ ] 确认 OAuth 回调 URL 正确

### 文档

- [ ] README.md 已更新
- [ ] DEPLOYMENT.md 包含最新部署步骤
- [ ] API 文档已更新（如有 API 变更）
- [ ] 变更日志已更新

### 安全

- [ ] 没有硬编码的密钥
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 敏感配置使用环境变量
- [ ] CORS 配置正确
- [ ] 安全响应头已配置

## 🚀 自动化清理脚本

创建一个自动化清理脚本 `scripts/cleanup-before-deploy.sh`：

```bash
#!/bin/bash

echo "🧹 开始部署前清理..."

# 清理临时文件
echo "📝 清理临时文件..."
rm -f check-user.js reset-password.js
rm -f logo.jpeg logo2.png favcion.png
rm -f 3fd35a3ffd8fbb96f250fac4afccf612.jpg

# 清理 web app
echo "🌐 清理 Web 应用..."
cd apps/web
rm -f check-skills.js check-status.js
rm -f clean-cache.ps1 restart-dev.ps1
rm -f tsconfig.tsbuildinfo
rm -rf .next .swc
cd ../..

# 清理缓存
echo "🗄️  清理缓存..."
rm -rf .turbo/cache

# 归档文档
echo "📚 归档文档..."
if [ ! -d "docs/archive/2024-development" ]; then
    mkdir -p docs/archive/2024-development
    mkdir -p docs/archive/completed-features
    mkdir -p docs/archive/planning
    
    mv docs/MY_SKILLHUB_*.md docs/archive/2024-development/ 2>/dev/null || true
    mv docs/PASSWORD_LOGIN_*.md docs/archive/completed-features/ 2>/dev/null || true
    mv docs/WIDGET_*.md docs/archive/completed-features/ 2>/dev/null || true
fi

echo "✅ 清理完成！"
echo ""
echo "📋 下一步："
echo "1. 检查 git status: git status"
echo "2. 运行测试: npm test"
echo "3. 构建项目: cd apps/web && npm run build"
echo "4. 提交更改: git add . && git commit -m 'chore: cleanup before deployment'"
```

使脚本可执行：

```bash
chmod +x scripts/cleanup-before-deploy.sh
```

运行清理：

```bash
./scripts/cleanup-before-deploy.sh
```

## 📊 清理后验证

清理完成后，运行以下命令验证：

```bash
# 检查 git 状态
git status

# 查看将要提交的文件
git diff --stat

# 确认没有意外删除重要文件
git diff --name-only
```

## ⚠️ 注意事项

1. **备份重要数据**：清理前确保已提交所有重要更改
2. **团队协作**：通知团队成员即将进行清理
3. **逐步执行**：建议分步骤执行清理，每步验证后再继续
4. **保留历史**：归档而不是删除重要文档，保留历史记录
5. **测试验证**：清理后运行完整测试套件确保功能正常

## 🔄 回滚方案

如果清理后发现问题：

```bash
# 恢复删除的文件（如果还在 git 中）
git checkout HEAD -- <filename>

# 或者从最近的提交恢复
git reset --hard HEAD~1
```

---

**最后更新**: 2024-04-23
**维护者**: SkillHub Team

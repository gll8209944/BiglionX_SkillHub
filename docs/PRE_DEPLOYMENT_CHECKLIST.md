# 部署前检查清单

在将 SkillHub 部署到生产环境之前，请完成以下所有检查项。

## 📋 代码质量检查

### 1. ESLint 检查

```bash
npm run lint
```

- [ ] 没有 ESLint 错误
- [ ] 警告已审查并确认可以接受

### 2. TypeScript 类型检查

```bash
cd apps/web
npx tsc --noEmit
```

- [ ] 没有 TypeScript 类型错误
- [ ] 所有类型定义正确

### 3. 代码格式化

```bash
# 如果有 Prettier
npm run format
```

- [ ] 代码格式一致

## 🧪 测试

### 1. 单元测试

```bash
npm test
```

- [ ] 所有单元测试通过
- [ ] 测试覆盖率符合要求

### 2. E2E 测试

```bash
cd apps/web
npm run cypress:run
```

- [ ] 所有 E2E 测试通过
- [ ] 关键用户流程已验证

### 3. 手动测试

- [ ] 登录功能正常（GitHub、邮箱验证码、密码）
- [ ] Admin 用户登录后跳转到 /admin
- [ ] 普通用户登录后跳转到 /dashboard
- [ ] Skills 浏览和搜索功能正常
- [ ] 发布 Skill 功能正常
- [ ] 登出功能正常，重定向到首页

## 🔨 构建验证

### 1. 清理构建缓存

```bash
# 使用清理脚本
./scripts/cleanup-before-deploy.sh  # Linux/Mac
# 或
scripts\cleanup-before-deploy.bat   # Windows

# 或手动清理
rm -rf apps/web/.next
rm -rf apps/web/.swc
rm -rf .turbo/cache
```

- [ ] 构建缓存已清理

### 2. 执行生产构建

```bash
cd apps/web
npm run build
```

- [ ] 构建成功，无错误
- [ ] 构建输出符合预期
- [ ] 记录构建产物大小

### 3. 本地预览生产构建

```bash
cd apps/web
npm run start
```

- [ ] 在 http://localhost:3000 访问应用
- [ ] 主要功能正常工作
- [ ] 性能表现良好

## 🔐 安全审查

### 1. 环境变量

- [ ] 所有敏感信息使用环境变量
- [ ] 没有硬编码的 API Key、Token 或密码
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] 生产环境变量已配置

检查命令：
```bash
# 搜索可能的硬编码密钥
grep -r "sk_live_" --include="*.ts" --include="*.tsx" --include="*.js" apps/
grep -r "ghp_" --include="*.ts" --include="*.tsx" --include="*.js" apps/
grep -r "re_" --include="*.ts" --include="*.tsx" --include="*.js" apps/
```

### 2. 依赖安全

```bash
npm audit
```

- [ ] 没有高危安全漏洞
- [ ] 中危漏洞已评估并处理

### 3. 安全响应头

- [ ] Content-Security-Policy 已配置
- [ ] X-Frame-Options 设置为 DENY
- [ ] X-Content-Type-Options 设置为 nosniff
- [ ] Strict-Transport-Security 在生产环境启用

检查文件：`apps/web/middleware.ts`

### 4. CORS 配置

- [ ] CORS 策略正确配置
- [ ] 只允许信任的域名

## 🌍 环境配置

### 1. 数据库

- [ ] 数据库连接字符串正确
- [ ] 数据库迁移已执行
  ```bash
  cd apps/web
  npx prisma migrate deploy
  ```
- [ ] 数据库索引已创建
- [ ] 种子数据已加载（如需要）

### 2. NextAuth 配置

- [ ] `NEXTAUTH_SECRET` 已设置且足够随机
- [ ] `NEXTAUTH_URL` 设置为生产域名
- [ ] GitHub OAuth 回调 URL 正确
- [ ] Resend API Key 已配置（如果使用邮箱登录）

### 3. Redis 配置

- [ ] Redis 连接字符串正确
- [ ] Upstash Redis 已配置（Vercel 部署）

### 4. 外部服务

- [ ] 智谱 AI API Key 已配置
- [ ] SkillsMP API Key 已配置
- [ ] GitHub Token 已配置（如需要）

## 📝 文档

### 1. README

- [ ] README.md 包含最新的项目介绍
- [ ] 安装和运行说明准确
- [ ] 贡献指南清晰

### 2. 部署文档

- [ ] DEPLOYMENT.md 包含最新的部署步骤
- [ ] 环境变量说明完整
- [ ] 故障排查指南有用

### 3. API 文档

- [ ] API 端点文档已更新
- [ ] 请求/响应示例准确

### 4. 变更日志

- [ ] CHANGELOG.md 或发布说明已更新
- [ ] 重大变更已标注

## 🗂️ 代码清理

### 1. 临时文件

- [ ] 运行清理脚本
  ```bash
  ./scripts/cleanup-before-deploy.sh
  ```
- [ ] 没有遗留的调试代码
- [ ] console.log 已移除或替换为 proper logging

### 2. 未使用的代码

- [ ] 删除未使用的导入
- [ ] 删除注释掉的代码块
- [ ] 删除临时的 TODO/FIXME（或转化为 issue）

### 3. 文档归档

- [ ] 开发过程中的文档已归档到 `docs/archive/`
- [ ] 核心文档保留在 `docs/` 根目录

## 🚀 部署平台特定检查

### Vercel 部署

- [ ] `vercel.json` 配置正确
- [ ] 环境变量在 Vercel Dashboard 中配置
- [ ] 构建命令和输出目录正确
- [ ] 自定义域名已配置（如需要）

检查文件：
- `apps/web/vercel.json`
- `package.json` scripts

### Docker 部署

- [ ] Dockerfile 正确
- [ ] docker-compose.yml 配置完整
- [ ] 环境变量通过 .env 文件或 secrets 传递
- [ ]  volumes 和 networks 配置正确

检查文件：
- `Dockerfile.web`
- `docker-compose.yml`
- `.dockerignore`

### 其他平台

根据实际部署平台调整检查项。

## 📊 性能优化

### 1. 前端性能

- [ ] 图片已优化（使用 WebP/AVIF）
- [ ] 代码分割合理
- [ ] 懒加载已实施
- [ ] Bundle 大小合理

### 2. 数据库性能

- [ ] 查询已优化
- [ ] 必要的索引已创建
- [ ] N+1 查询问题已解决

### 3. 缓存策略

- [ ] 静态资源缓存策略正确
- [ ] API 响应缓存已配置（如适用）
- [ ] Redis 缓存正常工作

## 🔍 SEO 和可访问性

### 1. SEO

- [ ] 页面标题和描述正确
- [ ] Open Graph 标签已设置
- [ ] sitemap.xml 生成正确
- [ ] robots.txt 配置正确

### 2. 可访问性

- [ ] 语义化 HTML 使用正确
- [ ] ARIA 标签适当使用
- [ ] 键盘导航可用
- [ ] 颜色对比度符合标准

## 📱 响应式设计

- [ ] 移动端布局正常
- [ ] 平板设备布局正常
- [ ] 桌面端布局正常
- [ ] 各种屏幕尺寸测试通过

## 🔄 备份和回滚

### 1. 数据库备份

- [ ] 部署前已备份数据库
  ```bash
  ./scripts/backup-database.sh
  ```

### 2. 回滚计划

- [ ] 回滚步骤已文档化
- [ ] 团队成员了解回滚流程

### 3. 监控和告警

- [ ] 错误监控已配置（如 Sentry）
- [ ] 性能监控已配置
- [ ] 告警规则已设置

## 👥 团队协作

### 1. 代码审查

- [ ] 所有更改已进行 Code Review
- [ ] PR 中的讨论已解决
- [ ] 至少一人批准

### 2. 分支管理

- [ ] 从正确的分支部署（main/master）
- [ ] 分支是最新的
- [ ] 没有未合并的冲突

### 3. 通知团队

- [ ] 团队成员知道即将部署
- [ ] 部署时间窗口已确定
- [ ] 值班人员已安排

## ✅ 最终确认

在点击部署按钮之前：

- [ ] 所有上述检查项已完成
- [ ] 团队负责人已批准部署
- [ ] 部署时间在维护窗口内（如需要）
- [ ] 回滚计划已准备就绪
- [ ] 监控系统正在运行

---

## 📝 部署后验证

部署完成后，立即验证：

- [ ] 应用可以访问
- [ ] 登录功能正常
- [ ] 主要业务流程正常
- [ ] 没有错误日志
- [ ] 性能指标正常
- [ ] 监控仪表板显示正常

---

**最后更新**: 2024-04-23  
**维护者**: SkillHub Team  
**版本**: 1.0

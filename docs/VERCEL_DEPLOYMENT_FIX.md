# Vercel 部署问题修复指南

## 已修复的问题

### 1. ✅ 退出登录 405 错误

**问题**: `/api/auth/signout` 返回 405 Method Not Allowed

**原因**: NextAuth v5 不支持直接 POST 到 `/api/auth/signout` 端点

**解决方案**: 
- 创建了 Server Action: `app/actions/auth-actions.ts`
- 修改了所有退出登录按钮使用 `handleSignOut()` Server Action
- 影响文件:
  - `app/dashboard/layout.tsx`
  - `app/skills/page.tsx`

### 2. ⚠️ ERR_CACHE_READ_FAILURE (浏览器缓存错误)

**问题**: 浏览器报告缓存读取失败

**原因**: 通常是 CDN 或网络问题，不影响功能

**建议**: 
- 清除浏览器缓存后重试
- 检查网络连接
- 此错误通常会自动恢复

### 3. ⚠️ npm 依赖警告

**问题**: 多个 deprecated 包警告

**影响**: 不影响功能，但建议后续更新

**相关包**:
- `whatwg-encoding@3.1.1` → 建议使用 `@exodus/bytes`
- `inflight@1.0.6` → 内存泄漏风险
- `glob@7.2.3` 和 `glob@10.5.0` → 安全漏洞
- `@types/bcryptjs@3.0.0` → stub 类型定义

**建议**: 在下次迭代中更新这些依赖

### 4. ℹ️ Schedule disabled

**状态**: 预期行为

**说明**: Vercel Cron 任务已在配置中禁用（见 `next.config.js`）

---

## Vercel 环境变量配置清单

确保在 Vercel Dashboard 中设置以下环境变量：

### 必需的环境变量

```bash
# 数据库配置
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# NextAuth 配置
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app

# Redis 配置 (Upstash)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# Prisma 优化
PRISMA_GENERATE_SKIP_AUTOINSTALL=true

# Cypress 优化 (构建时不需要)
CYPRESS_INSTALL_BINARY=0

# API Keys (根据需要)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SKILLSMP_API_KEY=your_skillsmp_api_key
ZHIPU_API_KEY=your_zhipu_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

### 重要提示

1. **PRISMA_GENERATE_SKIP_AUTOINSTALL=true** 
   - 必须在 Vercel 环境变量中设置
   - 防止 Prisma 在生成时尝试自动安装二进制文件
   - 避免 Vercel 部署超时

2. **CYPRESS_INSTALL_BINARY=0**
   - 已在 `vercel.json` 中配置
   - 跳过 Cypress 二进制文件下载
   - 加快构建速度

---

## 部署验证步骤

### 1. 提交代码更改

```bash
git add .
git commit -m "fix: 修复退出登录 405 错误，使用 Server Action"
git push origin main
```

### 2. 检查 Vercel 部署日志

访问 Vercel Dashboard，确认：
- ✅ 构建成功
- ✅ Prisma generate 成功
- ✅ 没有 405 错误
- ⚠️ deprecated 警告可以忽略（非阻塞）

### 3. 测试退出登录功能

1. 访问部署后的网站
2. 登录账户
3. 点击退出登录按钮
4. 确认成功退出并重定向到首页

### 4. 验证其他功能

- [ ] 页面加载正常
- [ ] 技能浏览功能正常
- [ ] 用户认证流程正常
- [ ] 数据库连接正常

---

## 常见问题排查

### Q1: 部署仍然失败？

**检查项**:
1. 确认所有环境变量已正确设置
2. 检查 `package-lock.json` 是否与 `package.json` 同步
3. 查看完整的构建日志找出具体错误

**解决**:
```bash
# 本地重新生成 lock 文件
npm install
git add package-lock.json
git commit -m "chore: 更新 package-lock.json"
git push
```

### Q2: Prisma 生成失败？

**检查项**:
1. 确认 `PRISMA_GENERATE_SKIP_AUTOINSTALL=true` 已设置
2. 检查 `schema.prisma` 中的 `binaryTargets` 配置

**当前配置** (已正确):
```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
  binaryTargets   = ["native", "rhel-openssl-3.0.x"]
}
```

### Q3: 数据库连接失败？

**检查项**:
1. 确认 `DATABASE_URL` 和 `DIRECT_URL` 格式正确
2. 检查 Neon 数据库是否允许来自 Vercel 的连接
3. 验证 SSL 模式设置 (`sslmode=require`)

---

## 后续优化建议

### 短期 (1-2 周)

1. **更新 deprecated 依赖**
   ```bash
   npm update glob inflight whatwg-encoding
   ```

2. **添加错误监控**
   - 集成 Sentry 或类似服务
   - 捕获运行时错误

3. **优化缓存策略**
   - 配置 Next.js ISR (Incremental Static Regeneration)
   - 减少 ERR_CACHE_READ_FAILURE 发生

### 中期 (1 个月)

1. **性能优化**
   - 启用 Next.js Image Optimization
   - 实施代码分割
   - 优化数据库查询

2. **安全性增强**
   - 定期更新依赖
   - 实施速率限制
   - 添加 CSP headers

3. **监控与告警**
   - 设置 uptime 监控
   - 配置错误告警
   - 跟踪关键指标

---

## 相关文件索引

### 核心配置文件
- `apps/web/next.config.js` - Next.js 配置
- `apps/web/vercel.json` - Vercel 部署配置
- `apps/web/prisma/schema.prisma` - 数据库 schema
- `turbo.json` - Monorepo 构建配置

### 认证相关文件
- `apps/web/lib/auth-config.ts` - NextAuth 配置
- `apps/web/app/api/auth/[...nextauth]/route.ts` - Auth API 路由
- `apps/web/app/actions/auth-actions.ts` - 认证 Server Actions ✨新增

### 修改的组件
- `apps/web/app/dashboard/layout.tsx` - 仪表板布局
- `apps/web/app/skills/page.tsx` - 技能页面

---

## 联系与支持

如果遇到问题，请检查：
1. Vercel 部署日志
2. 浏览器控制台错误
3. 网络请求状态码

**最后更新**: 2026-05-15

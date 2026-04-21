# Phase 1-2 快速启动指南

> **目标**: 5分钟内开始使用 SkillsMP 和 Skill Seekers 集成功能

---

## 🚀 快速开始（5分钟）

### Step 1: 安装依赖（已完成 ✅）

```bash
cd apps/web
npm install node-cache gray-matter bullmq ioredis node-cron
```

### Step 2: 配置环境变量

编辑 `apps/web/.env.local`，添加：

```bash
# SkillsMP API（可选，用于测试可暂时跳过）
SKILLSMP_API_KEY=your_skillsmp_api_key_here

# GitHub Token（推荐，提升速率限制）
GITHUB_TOKEN=ghp_your_personal_access_token
```

**获取 API Keys**:
- SkillsMP: https://skillsmp.com/signup → Dashboard → API Keys
- GitHub: https://github.com/settings/tokens → Generate new token (classic)
  - 权限 scopes: `repo`, `public_repo`

### Step 3: 更新数据库 Schema

```bash
cd apps/web

# 生成 Prisma Client
npx prisma generate

# 推送 Schema 到数据库
npx prisma db push
```

如果遇到文件锁定错误：
```bash
# 重启开发服务器后重试
# 或者强制重新生成
npx prisma generate --force
```

### Step 4: 测试 SkillsMP 导入

创建测试脚本 `test-skillsmp.mjs`:

```javascript
import { SkillsImportService } from './apps/web/lib/services/SkillsImportService.js';

async function test() {
  console.log('Testing SkillsMP import...');
  
  const service = new SkillsImportService();
  
  // 测试获取 trending skills
  try {
    const trending = await service.connector.getTrendingSkills(5);
    console.log('Trending skills:', trending.map(s => s.name));
  } catch (error) {
    console.error('Failed to fetch trending:', error.message);
  }
  
  // 测试全量导入（谨慎使用，会导入所有数据）
  // const result = await service.importAllSkills();
  // console.log('Import result:', result);
}

test();
```

运行测试：
```bash
node test-skillsmp.mjs
```

### Step 5: 测试 GitHub 爬虫

创建测试脚本 `test-crawler.mjs`:

```javascript
import { CrawlerService } from './apps/web/lib/services/CrawlerService.js';

async function test() {
  console.log('Testing GitHub crawler...');
  
  const service = new CrawlerService();
  
  // 测试爬取单个仓库
  try {
    const success = await service.crawlAndSave('microsoft/autogen');
    console.log('Crawl result:', success ? 'Success' : 'Failed');
  } catch (error) {
    console.error('Crawl failed:', error.message);
  }
  
  // 测试搜索并爬取
  // const result = await service.searchAndCrawl('AI agent skill', {
  //   minStars: 100,
  //   limit: 5,
  // });
  // console.log('Search and crawl result:', result);
}

test();
```

运行测试：
```bash
node test-crawler.mjs
```

### Step 6: 启动定时调度器（可选）

在 `apps/web/app/layout.tsx` 或服务器启动文件中添加：

```typescript
import { startScheduler } from '@/lib/services/TaskScheduler';

// 在应用启动时调用（仅在服务端）
if (typeof window === 'undefined') {
  startScheduler();
}
```

或者手动触发测试：

```typescript
import { getScheduler } from '@/lib/services/TaskScheduler';

const scheduler = getScheduler();

// 手动触发每日同步
await scheduler.triggerDailySync();

// 手动触发全量同步
await scheduler.triggerWeeklyFullSync();

// 查看调度器状态
console.log(scheduler.getStatus());
```

---

## 📊 验证安装

### 检查数据库表

```sql
-- 查看新增的字段
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'skills' 
AND column_name IN ('source', 'sourceId', 'qualityScore', 'starCount');

-- 查看新增的表
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('sync_logs', 'crawler_tasks');
```

### 检查导入的数据

```sql
-- 查看来自 SkillsMP 的 skills
SELECT COUNT(*) FROM skills WHERE source = 'skillsmp';

-- 查看来自 GitHub 的 skills
SELECT COUNT(*) FROM skills WHERE source = 'github';

-- 查看同步日志
SELECT * FROM sync_logs ORDER BY startedAt DESC LIMIT 5;

-- 查看爬虫任务
SELECT * FROM crawler_tasks ORDER BY createdAt DESC LIMIT 5;
```

---

## 🔍 常见问题

### Q1: Prisma Client 生成失败

**错误**: `EPERM: operation not permitted`

**解决**:
```bash
# 停止开发服务器
# 删除缓存
rm -rf node_modules/.prisma
rm -rf .next

# 重新生成
npx prisma generate
```

### Q2: SkillsMP API 返回 401

**原因**: API Key 无效或未配置

**解决**:
1. 检查 `.env.local` 中 `SKILLSMP_API_KEY` 是否正确
2. 登录 SkillsMP Dashboard 验证 API Key 状态
3. 重新生成 API Key

### Q3: GitHub 爬虫速率限制

**错误**: `API rate limit exceeded`

**解决**:
1. 配置 `GITHUB_TOKEN` 环境变量
2. 未认证用户：60 requests/hour
3. 认证用户：5,000 requests/hour

### Q4: 临时目录权限问题

**错误**: `EACCES: permission denied`

**解决**:
```bash
# 确保 temp 目录存在且有写权限
mkdir -p temp/skill-seekers
chmod 755 temp/skill-seekers
```

### Q5: Redis 连接失败（BullMQ）

**错误**: `Connection refused`

**解决**:
- 如果不使用 BullMQ，可以忽略此错误
- 如需使用，启动 Redis 服务：
  ```bash
  docker run -d -p 6379:6379 redis
  ```

---

## 📚 相关文档

- [GLOBAL_SKILLS_SEARCH_PLAN.md](./docs/GLOBAL_SKILLS_SEARCH_PLAN.md) - v2.0 整体规划
- [SKILLSMP_INTEGRATION_GUIDE.md](./docs/SKILLSMP_INTEGRATION_GUIDE.md) - SkillsMP 详细集成指南
- [SKILL_SEEKERS_CRAWLER_GUIDE.md](./docs/SKILL_SEEKERS_CRAWLER_GUIDE.md) - Skill Seekers 配置指南
- [PHASE_1_2_COMPLETION_REPORT.md](./PHASE_1_2_COMPLETION_REPORT.md) - 实施完成报告

---

## 🎯 下一步

Phase 1-2 已完成，接下来可以：

1. **Phase 3**: DeerFlow 2.0 集成（智能 Agent 编排）
2. **Phase 4**: 搜索系统优化（全文搜索 + 向量搜索）
3. **Phase 5**: 前端界面重构
4. **Phase 6**: 测试与发布

---

**需要帮助？**

- 查看完整文档: `docs/` 目录
- 提交 Issue: GitHub Issues
- 联系团队: dev@skillhub.io

---

_最后更新: 2026-04-18_

# 爬虫设置模块完善说明

## 已完成的功能

### 1. 数据库迁移
- ✅ 创建了 `crawler_configs` 表用于存储爬虫配置
- ✅ 迁移文件位置: `prisma/migrations/20260419_add_crawler_configs/migration.sql`

### 2. 前端界面
- ✅ 完整的爬虫设置页面 (`/admin/crawler`)
- ✅ 四个标签页：概览、数据源、采集配置、任务历史
- ✅ 统计卡片显示任务状态
- ✅ 数据源管理（GitHub、SkillsMP、GitLab、自定义仓库）
- ✅ 采集配置：
  - 专项搜索模式开关
  - 每次采集数量设置
  - 并发限制设置
  - 质量阈值设置
  - GitHub 搜索查询管理
  - 定时任务配置（Cron 表达式）
  - 过滤规则（最小 Stars、需要 SKILL.md、排除归档等）
- ✅ 立即启动爬虫功能
- ✅ 全量同步功能

### 3. API 路由
- ✅ `GET /api/admin/crawler/config` - 获取爬虫配置
- ✅ `POST /api/admin/crawler/config` - 保存爬虫配置
- ✅ `POST /api/admin/crawler/start` - 启动爬虫任务

### 4. 服务层
- ✅ `CrawlerConfigService` - 爬虫配置管理服务
- ✅ 支持配置的增删改查
- ✅ 支持数据源管理
- ✅ 支持搜索查询管理

## 需要执行的步骤

### 1. 重新生成 Prisma Client

由于添加了新的 `CrawlerConfig` 模型，需要重新生成 Prisma Client：

```bash
cd apps/web
npx prisma generate
```

**注意**: 如果开发服务器正在运行，可能需要先停止它，因为文件可能被锁定。

### 2. 应用数据库迁移

```bash
cd apps/web
npx prisma migrate deploy
```

或者在开发环境中：

```bash
cd apps/web
npx prisma migrate dev
```

### 3. 初始化默认配置

首次使用时，系统会自动创建默认配置。如果需要手动初始化，可以访问：

```
http://localhost:3001/admin/crawler
```

然后点击"保存配置"按钮。

## 功能说明

### 数据源配置

支持四种数据源：
1. **GitHub** (默认启用)
   - 通过 GitHub API 搜索和爬取
   - 可配置搜索查询列表
   - 可设置最小 Stars 数
   - 可设置最大结果数

2. **SkillsMP**
   - 从 SkillsMP API 获取 trending skills
   - 需要配置 API Key

3. **GitLab**
   - 从 GitLab 仓库爬取
   - 需要配置 Access Token

4. **自定义仓库**
   - 手动添加特定的仓库 URL
   - 适合采集特定的高质量项目

### 采集策略

- **专项搜索模式**: 针对特定领域进行深度采集
- **批量大小**: 每次处理的仓库数量 (1-100)
- **并发限制**: 同时进行的爬取任务数 (1-20)
- **质量阈值**: 只采集质量评分高于此值的 Skills (0-100)
- **目标语言**: 优先采集特定编程语言的仓库
- **目标分类**: 优先采集特定分类的 Skills

### 定时任务

- 支持 Cron 表达式配置
- 默认每天凌晨 3 点执行
- 可配置时区 (默认 Asia/Shanghai)
- 可随时启用/禁用

### 过滤规则

- 排除已归档的仓库
- 设置最小更新时间（默认 90 天内）
- 要求必须包含 SKILL.md 文件
- 设置最小描述长度

### 立即启动

点击"立即启动爬虫"按钮后，系统会：
1. 读取当前配置
2. 根据启用的数据源开始采集
3. 按照配置的参数执行爬取
4. 实时显示任务进度
5. 记录审计日志

## 使用示例

### 1. 配置 GitHub 数据源

1. 进入"数据源"标签页
2. 确保 GitHub 已启用
3. 进入"采集配置"标签页
4. 添加搜索查询，如：
   - `skill.md`
   - `ai agent`
   - `llm tool`
   - `autonomous`
5. 设置最小 Stars 数为 50
6. 设置每次采集数量为 30
7. 点击"保存配置"

### 2. 启动爬虫

1. 返回"概览"标签页
2. 点击"立即启动爬虫"
3. 确认配置信息
4. 点击"确认启动"
5. 系统开始执行爬取任务

### 3. 查看任务状态

1. 在"概览"页面查看统计数据
2. 在"任务历史"标签页查看详细记录
3. 每个任务显示：
   - 任务类型
   - 目标
   - 状态
   - 创建时间
   - 完成时间

## 后续优化建议

1. **实时进度显示**: 使用 WebSocket 或 Server-Sent Events 显示实时进度
2. **任务队列管理**: 支持暂停、恢复、取消任务
3. **结果预览**: 在采集完成后预览新发现的 Skills
4. **冲突检测**: 检测并处理重复的 Skills
5. **通知系统**: 任务完成时发送通知
6. **性能监控**: 监控爬取速度和成功率
7. **错误重试**: 自动重试失败的爬取任务
8. **数据导出**: 支持导出采集的数据

## 技术架构

```
前端 (Next.js)
  ↓
API Routes (/api/admin/crawler/*)
  ↓
Service Layer (CrawlerService, CrawlerConfigService)
  ↓
Database (Prisma + PostgreSQL)
  ↓
External APIs (GitHub, SkillsMP, GitLab)
```

## 注意事项

1. **GitHub API 速率限制**: 
   - 未认证: 60 次/小时
   - 已认证: 5000 次/小时
   - 建议在 `.env.local` 中配置 `GITHUB_TOKEN`

2. **并发控制**: 
   - 不要设置过高的并发限制
   - 避免触发 API 速率限制

3. **数据存储**: 
   - 定期清理旧的任务记录
   - 监控数据库大小

4. **权限控制**: 
   - 目前所有登录用户都可以访问
   - 建议添加管理员角色检查

## 故障排除

### 问题: Prisma Client 类型错误

**解决方案**:
```bash
cd apps/web
npx prisma generate
```

### 问题: 数据库迁移失败

**解决方案**:
```bash
cd apps/web
npx prisma migrate reset
npx prisma migrate dev
```

### 问题: 爬虫无法启动

**检查项**:
1. 是否配置了 GITHUB_TOKEN
2. 数据源是否已启用
3. 查看浏览器控制台和网络请求
4. 查看服务器日志

## 相关文件

- 前端页面: `apps/web/app/admin/crawler/page.tsx`
- 客户端组件: `apps/web/app/admin/crawler/CrawlerSettingsClient.tsx`
- 配置服务: `apps/web/lib/services/CrawlerConfigService.ts`
- 爬虫服务: `apps/web/lib/services/CrawlerService.ts`
- API 路由: `apps/web/app/api/admin/crawler/*/route.ts`
- 数据库模型: `apps/web/prisma/schema.prisma`

# Skill Hub 独立项目开发计划 v2.1 (Monorepo方案)

> **项目名称**: Skill Hub - AI Agent技能注册中心 (独立开源版)
> **项目地址**: https://skillhub.proclaw.cc
> **GitHub**: https://github.com/BigLionX/SkillHub
> **版本**: v2.1.0 (Monorepo优化版)
> **创建日期**: 2026-04-16
> **更新日期**: 2026-04-17
> **预计周期**: 10周
> **架构**: Monorepo (Turborepo)
> **状态**: ✅ v1.0.0 已发布

---

## 🎯 方案调整总结

### 核心变化

| 维度           | 原计划v2.0      | 调整后v2.1              | 说明                  |
| -------------- | --------------- | ----------------------- | --------------------- |
| **项目结构**   | 单一Next.js应用 | Monorepo (Turborepo)    | 更清晰的代码组织      |
| **Week 1重点** | Next.js初始化   | Monorepo搭建 + 代码提取 | 前期多花1-2天         |
| **代码复用**   | 0%              | 30-40%                  | 从ProClaw提取UI和工具 |
| **总周期**     | 10周            | 10周                    | 不变                  |
| **初期复杂度** | 低              | 中                      | 学习曲线稍陡          |
| **长期维护**   | 中              | 低                      | 更易维护              |
| **工作量**     | 100%新写        | 60-70%新写              | 节省2-3周             |

### 为什么调整？

✅ **代码复用**: 复用ProClaw成熟的UI组件和工具函数
✅ **架构清晰**: Monorepo便于管理和扩展
✅ **未来扩展**: 可以发布npm包供ProClaw使用
✅ **质量提升**: 复用经过验证的代码

---

## 📦 Monorepo项目结构

```
skillhub-monorepo/
├── packages/
│   ├── ui/                   # UI组件库 (从ProClaw提取)
│   │   ├── src/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── theme/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── utils/                # 工具函数 (从ProClaw提取)
│   │   ├── src/
│   │   │   ├── utils.ts
│   │   │   ├── validators.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── core/                 # 核心业务逻辑 (新写)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── api-client/           # API客户端SDK (新写)
│       ├── src/
│       └── package.json
│
├── apps/
│   ├── web/                  # Next.js Web应用 (新写)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── package.json
│   │   └── .env.local
│   │
│   └── cli/                  # CLI工具 (新写)
│       ├── src/
│       └── package.json
│
├── turbo.json                # Turborepo配置
├── package.json              # 根配置
├── .gitignore
└── README.md
```

---

## 📅 Week 1 详细任务 (调整后)

### Day 1: Monorepo架构搭建

**任务**:

- [ ] 创建目录结构
- [ ] 初始化根package.json
- [ ] 安装Turborepo
- [ ] 配置turbo.json
- [ ] 初始化Git仓库

**命令**:

```bash
cd D:\BigLionX\SkillHub
npm init -y
npm install -D turbo
mkdir -p packages/{ui,utils,core,api-client}/src
mkdir -p apps/{web,cli}
git init
git add .
git commit -m "Initial commit: Monorepo structure"
```

**验收**: `npx turbo build` 无错误

---

### Day 2: 提取UI组件

**任务**:

- [ ] 复制UI组件到packages/ui/src
- [ ] 复制主题配置
- [ ] 创建index.ts
- [ ] 配置package.json和tsconfig.json

**命令**:

```bash
cp -r D:\BigLionX\3cep\src\components\ui\* packages\ui\src\
cp -r D:\BigLionX\3cep\src\theme\* packages\ui\src\theme\
```

**验收**: TypeScript编译通过

---

### Day 3: 提取工具函数

**任务**:

- [ ] 复制工具函数到packages/utils/src
- [ ] 创建index.ts
- [ ] 配置package.json

**命令**:

```bash
cp D:\BigLionX\3cep\src\lib\utils.ts packages\utils\src\
cp D:\BigLionX\3cep\src\lib\validators.ts packages\utils\src\
```

**验收**: 可以导入工具函数

---

### Day 4: 数据库设计

**任务**:

- [ ] 在apps/web中初始化Next.js
- [ ] 安装和配置Prisma
- [ ] 执行数据库迁移
- [ ] 生成Prisma Client

**命令**:

```bash
cd apps\web
npx create-next-app@latest . --typescript --tailwind --app
npm install @prisma/client
npm install -D prisma
npx prisma init
npx prisma migrate dev --name init
```

**验收**: 数据库连接正常，Prisma Client生成成功

---

### Day 5: 测试和评审

**任务**:

- [ ] 测试Monorepo构建
- [ ] 测试跨包引用
- [ ] 代码审查
- [ ] 团队会议
- [ ] 分配Week 2任务

**命令**:

```bash
cd D:\BigLionX\SkillHub
npm install
npx turbo build
git add .
git commit -m "Week 1 complete: Monorepo setup"
```

**验收**:

- ✅ `npx turbo build` 成功
- ✅ 跨包引用正常
- ✅ 团队明确后续任务

---

## 📊 Week 2-10 任务概览

### Week 2: 认证系统 + Skill基础API

- NextAuth.js集成
- 用户注册/登录
- OAuth (GitHub, Google)
- Skill CRUD API

### Week 3: Skill发布流程

- 发布向导UI
- Manifest验证器
- 文件上传
- 命名空间选择

### Week 4: 命名空间管理

- 命名空间CRUD
- 成员管理
- 权限控制
- 发布策略

### Week 5: 浏览和搜索

- 市场首页
- Skill详情页
- 全文搜索
- 筛选和排序

### Week 6: 审核系统

- 自动化审核
- 审核工作流状态机
- 审计日志
- 审核Dashboard

### Week 7: CLI工具

- CLI框架
- publish/install命令
- 配置管理
- 错误处理

### Week 8: ClawHub适配 + Docker

- ClawHub协议适配器
- Docker配置
- docker-compose.yml
- 部署文档

### Week 9: 性能优化 + 文档

- API缓存 (Redis)
- 图片优化
- Lighthouse优化
- 用户文档

### Week 10: 开源准备

- 代码清理
- License配置
- Beta测试
- GitHub发布

---

## 💻 代码复用策略

### 复用内容 (30-40%)

#### 1. UI组件 (@skillhub/ui)

- Button, Card, Dialog等基础组件
- MUI主题配置
- Tailwind配置
- 布局组件

#### 2. 工具函数 (@skillhub/utils)

- 通用工具函数 (utils.ts)
- 数据验证 (validators.ts)
- 格式化函数 (formatters.ts)
- 常量定义

### 新写内容 (60-70%)

#### 1. 认证系统 (100%新写)

- NextAuth.js配置
- 用户注册/登录页面
- OAuth集成
- Session管理

#### 2. 业务逻辑 (80%新写)

- Skill管理服务
- 命名空间服务
- 审核工作流
- 审计日志

#### 3. 前端页面 (70%新写)

- 首页
- Dashboard
- 管理后台
- Skill详情页

#### 4. CLI工具 (100%新写)

- 命令行框架
- 所有命令实现
- 配置管理

---

## 🎯 成功标准

### 技术指标

- ✅ API P95 < 200ms
- ✅ 首屏加载 < 2s
- ✅ 可用性 > 99.9%
- ✅ 测试覆盖率 > 80%
- ✅ Lighthouse > 90
- ✅ Monorepo构建成功

### 开源指标

- ✅ GitHub Stars > 500 (3个月)
- ✅ Contributors > 10人
- ✅ Issues响应 < 48小时
- ✅ 每月1次Release
- ✅ 文档完整性 > 95%

### 产品指标

- ✅ 首批Skills > 50个
- ✅ 活跃开发者 > 100人
- ✅ 用户满意度 > 85%
- ✅ 审核通过率 > 70%

---

## 🚀 立即开始

### 步骤1: 确认环境

```bash
# 检查Node.js版本 (需要 >= 18)
node --version

# 检查npm版本
npm --version

# 进入项目目录
cd D:\BigLionX\SkillHub
```

### 步骤2: 执行Day 1任务

按照上面Day 1的任务清单执行，或直接运行：

```bash
# 一键初始化脚本 (待创建)
# bash scripts/init-monorepo.sh
```

### 步骤3: 每日站会

- **时间**: 每天上午10:00
- **内容**:
  - 昨天完成了什么
  - 今天计划做什么
  - 遇到什么问题

---

## 📚 相关文档

- [Skill Hub独立项目计划](./SKILLHUB_STANDALONE_PLAN.md) - 原始计划
- [Skill Hub README模板](./SKILLHUB_STANDALONE_README_TEMPLATE.md) - GitHub README
- [Skill Hub规划总结](./SKILLHUB_STANDALONE_SUMMARY.md) - 工作总结
- [详细开发计划v2.0](./SKILLHUB_DEVELOPMENT_PLAN_V2.md) - 技术细节
- [快速启动清单](./SKILLHUB_QUICK_START_CHECKLIST.md) - Week 1详细步骤

---

## 💡 关键提醒

### ⚠️ 注意事项

1. **依赖管理**: 使用peerDependencies避免重复安装
2. **包独立性**: 每个package应该可以独立构建
3. **版本管理**: 使用语义化版本 (semver)
4. **文档同步**: 每个package都要有README

### ✅ 最佳实践

1. **小步快跑**: 每天提交代码
2. **及时测试**: 每完成一个功能就测试
3. **代码审查**: 重要修改需要review
4. **文档先行**: 先写文档再写代码

---

**文档版本**: v2.1.0
**最后更新**: 2026-04-17
**状态**: ✅ v1.0.0 已发布
**下一步**: 继续开发 v1.1.0 功能

---

_Skill Hub v1.0.0 已正式发布！_ 🚀

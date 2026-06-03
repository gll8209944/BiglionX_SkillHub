# SkillHub 双模式架构说明

> **重要提示**：SkillHub 提供两种独立的使用模式，互不干扰，可以同时使用。

---

## 📋 目录

- [模式对比](#模式对比)
- [模式一：自主管理平台](#模式一自主管理平台)
- [模式二：全球搜索引擎](#模式二全球搜索引擎)
- [技术实现](#技术实现)
- [常见问题](#常见问题)

---

## 模式对比

| 特性 | 模式一：自主管理 | 模式二：搜索引擎 |
|------|----------------|----------------|
| **数据来源** | 用户上传 | GitHub API 自动爬取 |
| **存储内容** | 完整代码 + 元数据 | 仅元数据（无代码） |
| **存储空间** | 需要较大存储 | 轻量级（仅数据库） |
| **更新方式** | 用户手动上传 | 自动定时同步 |
| **下载方式** | 从 SkillHub 下载 | 跳转到 GitHub 下载 |
| **适用场景** | 企业内部、私有技能 | 发现全球公开 Skills |
| **权限控制** | ✅ 完整权限系统 | ❌ 只读浏览 |
| **版本管理** | ✅ 多版本支持 | ⚠️ 仅最新信息 |

---

## 模式一：自主管理平台

### 核心功能

用户可以自己创建命名空间、上传和管理 Skills：

```
用户操作流程：
1. 注册/登录 SkillHub
2. 创建命名空间（个人或团队）
3. 上传 Skill 代码包
4. 设置版本、标签、描述
5. 发布到市场（公开或私有）
6. 其他用户浏览和下载
```

### 数据存储

```
存储内容：
├── Skill 元数据（数据库）
│   ├── 名称、描述、版本
│   ├── 作者、标签、分类
│   └── 评分、下载统计
├── Skill 代码文件（对象存储）
│   ├── SKILL.md
│   ├── scripts/
│   ├── assets/
│   └── package.json
└── 版本历史
    ├── v1.0.0
    ├── v1.1.0
    └── v2.0.0
```

### 使用场景

- **企业内部** - 搭建私有技能市场
- **团队协作** - 共享团队开发的 Skills
- **商业服务** - 提供付费 Skill 订阅
- **开源社区** - 社区驱动的技能分享

---

## 模式二：全球搜索引擎

### 核心功能

自动发现和索引全球的 Skills，方便用户浏览和下载：

```
数据采集流程：
1. GitHub API 搜索相关仓库
2. 获取仓库元数据（名称、描述、Star数等）
3. 保存到 SkillHub 数据库
4. 用户在 SkillHub 浏览和搜索
5. 点击"下载"跳转到 GitHub
```

### 数据存储

```
存储内容（仅元数据）：
├── Skill 基本信息
│   ├── name: "everything-claude-code"
│   ├── description: "..."
│   ├── repositoryUrl: "https://github.com/..."
│   ├── starCount: 159879
│   ├── downloadCount: 12345
│   └── qualityScore: 100
├── 作者信息
│   ├── authorName: "affaan-m"
│   └── authorUrl: "https://github.com/affaan-m"
└── 分类标签
    ├── category: "development"
    ├── tags: ["claude", "skills", "ai"]
    └── languages: ["TypeScript"]

❌ 不存储：
- 完整的代码文件
- SKILL.md 内容（可选获取 README）
- 历史版本
```

### 技术实现

#### 爬虫脚本

```typescript
// scripts/crawl-github-metadata.ts

// 1. 搜索 GitHub 仓库
const repos = await axios.get('https://api.github.com/search/repositories', {
  params: { q: 'claude skills stars:>10' }
});

// 2. 提取元数据
for (const repo of repos.data.items) {
  const skillData = {
    name: repo.name,
    description: repo.description,
    repositoryUrl: repo.html_url,  // 原始链接
    starCount: repo.stargazers_count,
    downloadCount: repo.forks_count,
    // ... 其他元数据
  };
  
  // 3. 保存到数据库
  await prisma.skill.create({ data: skillData });
}
```

#### 关键特点

- ✅ **轻量级** - 只调用 GitHub API，不克隆仓库
- ✅ **快速** - 每次请求 < 1秒
- ✅ **节省空间** - 85 个技能仅占用几 MB 数据库空间
- ✅ **实时性** - 始终指向最新的 GitHub 仓库

### 使用场景

- **开发者发现** - 寻找优秀的开源 Skills
- **学习参考** - 浏览高质量的 Skill 实现
- **趋势分析** - 了解 AI Agent 生态发展
- **快速原型** - 找到合适的 Skill 直接使用

---

## 技术实现

### 数据库设计

```prisma
model Skill {
  id              String   @id @default(uuid())
  name            String
  description     String
  version         String
  
  // 来源标识
  source          String?  // 'github', 'skillsmp', 'user-upload'
  sourceId        String?  // 外部平台的 ID
  sourceUrl       String?  // 外部平台 URL
  
  // 元数据字段（搜索引擎模式）
  repositoryUrl   String?  // GitHub 仓库地址
  starCount       Int      @default(0)
  qualityScore    Float    @default(0)
  authorName      String?
  authorUrl       String?
  
  // 用户上传模式的字段
  authorId        String   // 关联 User
  namespaceId     String?  // 关联 Namespace
  packageUrl      String?  // 下载链接（用户上传时指向 S3）
  
  // 通用字段
  status          SkillStatus
  isPublic        Boolean
  createdAt       DateTime
  updatedAt       DateTime
}
```

### 前端展示

#### 搜索引擎模式的技能卡片

```tsx
// /app/skills/[slug]/page.tsx

<div className="skill-card">
  <h2>{skill.name}</h2>
  <p>{skill.description}</p>
  
  {/* 显示来源标识 */}
  {skill.source === 'github' && (
    <span className="badge">🐙 GitHub</span>
  )}
  
  {/* 统计信息 */}
  <div className="stats">
    <span>⭐ {skill.starCount}</span>
    <span>📥 {skill.downloadCount}</span>
    <span>✨ Quality: {skill.qualityScore}</span>
  </div>
  
  {/* 下载按钮 - 跳转到 GitHub */}
  <a href={skill.repositoryUrl} target="_blank">
    查看并下载 →
  </a>
</div>
```

#### 用户上传模式的技能卡片

```tsx
<div className="skill-card">
  <h2>{skill.name}</h2>
  <p>{skill.description}</p>
  
  {/* 显示作者信息 */}
  <div className="author">
    <img src={skill.author.image} />
    <span>{skill.author.name}</span>
  </div>
  
  {/* 版本选择 */}
  <select>
    {skill.versions.map(v => (
      <option value={v.version}>v{v.version}</option>
    ))}
  </select>
  
  {/* 下载按钮 - 从 SkillHub 下载 */}
  <button onClick={() => downloadSkill(skill.id)}>
    下载安装
  </button>
</div>
```

---

## 常见问题

### Q1: 两种模式会冲突吗？

**A:** 不会。两种模式完全独立：

- **数据来源不同** - 一个来自用户上传，一个来自 GitHub API
- **存储方式不同** - 一个存完整代码，一个只存元数据
- **下载方式不同** - 一个从 SkillHub 下载，一个跳转 GitHub
- **权限控制不同** - 一个有完整权限系统，一个只读浏览

### Q2: 同一个 Skill 会重复出现吗？

**A:** 有可能，但这是有意设计的：

```
示例：
- 用户上传的 "react-helper" v1.0.0（存储在 SkillHub）
- GitHub 爬取的 "react-helper"（指向 github.com/user/react-helper）

用户可以通过来源标识区分：
- 🏠 SkillHub（用户上传）
- 🐙 GitHub（自动索引）
```

### Q3: 搜索引擎模式会影响性能吗？

**A:** 不会，反而提升性能：

- ✅ **不存储大文件** - 节省存储空间
- ✅ **轻量级查询** - 只查询数据库元数据
- ✅ **CDN 加速** - GitHub 提供全球 CDN
- ✅ **缓存优化** - 可以缓存热门技能的元数据

### Q4: 如何关闭搜索引擎功能？

**A:** 很简单，只需：

```bash
# 停止定时爬虫任务
# 删除或注释掉 cron job
# 或者设置环境变量
SKIP_GLOBAL_CRAWLER=true
```

SkillHub 的核心功能（用户上传和管理）不受影响。

### Q5: 搜索引擎的数据准确吗？

**A:** 数据来自 GitHub API，准确性高：

- ✅ **Star 数** - 实时从 GitHub 获取
- ✅ **描述** - 直接使用 GitHub 仓库描述
- ✅ **链接** - 直接指向原始仓库
- ⚠️ **更新延迟** - 取决于爬虫频率（可配置为每天/每小时）

### Q6: 我可以只使用其中一种模式吗？

**A:** 完全可以！

```bash
# 只使用自主管理模式
docker-compose up -d  # 不启动爬虫任务

# 只使用搜索引擎模式
# 禁用用户注册，只开放浏览功能
```

---

## 总结

SkillHub 的双模式架构提供了灵活性：

- **模式一** - 适合需要完整控制的场景（企业、团队）
- **模式二** - 适合快速发现和学习的场景（个人开发者、研究者）

两种模式可以：
- ✅ 独立使用
- ✅ 同时启用
- ✅ 按需切换

无论选择哪种模式，SkillHub 都能满足你的需求！

---

**最后更新**: 2026-04-18  
**版本**: v2.0

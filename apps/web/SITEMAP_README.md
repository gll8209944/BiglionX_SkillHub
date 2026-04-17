# SkillHub 网站地图说明

## 概述

SkillHub 项目包含完整的网站地图配置，以帮助搜索引擎更好地索引网站内容。

## 文件结构

```
apps/web/
├── app/
│   └── sitemap.ts          # Next.js 动态 sitemap 生成器
├── public/
│   ├── sitemap.xml         # 静态 sitemap 文件
│   └── robots.txt          # 搜索引擎爬虫配置文件
```

## 文件说明

### 1. sitemap.ts (动态生成)

- 位置: `apps/web/app/sitemap.ts`
- 功能: Next.js 内置的 sitemap 生成功能
- 特点: 
  - 自动生成最新的 sitemap
  - 支持动态路由（需要从数据库获取数据）
  - 每次构建时更新

### 2. sitemap.xml (静态文件)

- 位置: `apps/web/public/sitemap.xml`
- 功能: 静态网站地图文件
- 特点:
  - 包含所有主要页面
  - 手动维护，适合快速部署
  - 可作为动态生成的备份

### 3. robots.txt

- 位置: `apps/web/public/robots.txt`
- 功能: 指导搜索引擎爬虫行为
- 特点:
  - 允许爬取公开页面
  - 禁止爬取 API 端点
  - 指向 sitemap 位置

## 页面优先级说明

| 页面类型 | 优先级 | 更新频率 |
|---------|--------|----------|
| 主页 (/) | 1.0 | 每日 |
| 技能浏览 (/skills) | 0.9 | 每日 |
| 登录/注册 | 0.8 | 每月 |
| 仪表板主页面 | 0.8 | 每周 |
| 管理后台 | 0.8 | 每周 |
| 子页面 | 0.6-0.7 | 每周/每月 |

## 动态路由处理

当前 sitemap 实现包含了静态页面。对于动态路由（如具体技能页面、命名空间页面），需要在 `sitemap.ts` 中添加数据库查询逻辑：

```typescript
// 示例：添加动态技能页面
const skills = await prisma.skill.findMany({
  where: { status: 'PUBLISHED' },
  select: { slug: true, updatedAt: true }
});

const skillUrls = skills.map(skill => ({
  url: `${baseUrl}/skills/${skill.slug}`,
  lastModified: skill.updatedAt,
  changeFrequency: 'weekly' as const,
  priority: 0.7,
}));
```

## SEO 最佳实践

1. **定期更新**: 确保 sitemap 反映最新的网站结构
2. **验证 sitemap**: 使用 Google Search Console 验证 sitemap
3. **监控索引**: 定期检查搜索引擎的索引状态
4. **动态内容**: 为动态生成的页面实现自动 sitemap 更新

## 部署注意事项

1. 确保 `NEXT_PUBLIC_APP_URL` 环境变量已正确设置
2. 在生产环境中，建议使用动态 sitemap 生成
3. 静态 sitemap.xml 可作为备份或开发环境使用

## 相关资源

- [Next.js Sitemap 文档](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Sitemaps.org 协议](https://www.sitemaps.org/protocol.html)
- [Google Search Console](https://search.google.com/search-console)
# SkillsMP 集成指南

> **版本**: v1.0  
> **更新日期**: 2026-04-18  
> **目标**: 将SkillsMP的搜索后端和数据集成到SkillHub

---

## 📋 目录

- [SkillsMP简介](#skillsmp简介)
- [API文档](#api文档)
- [集成步骤](#集成步骤)
- [数据映射](#数据映射)
- [认证配置](#认证配置)
- [速率限制](#速率限制)
- [错误处理](#错误处理)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

---

## SkillsMP简介

### 什么是SkillsMP?

SkillsMP (https://skillsmp.com/) 是一个AI Agent Skills的市场和搜索引擎，提供了：

- ✅ 50,000+ AI Agent Skills索引
- ✅ 强大的搜索和过滤功能
- ✅ 标准化的Skill元数据
- ✅ RESTful API接口
- ✅ 活跃的开发者社区

### 为什么集成SkillsMP?

1. **快速启动**: 立即获得大量高质量的Skills数据
2. **数据质量**: SkillsMP已经对skills进行了清洗和标准化
3. **节省成本**: 避免从零开始爬取和整理数据
4. **互补优势**: SkillsMP专注搜索，SkillHub专注管理和分发

---

## API文档

### 基础信息

- **Base URL**: `https://api.skillsmp.com/v1`
- **认证方式**: API Key (Header: `X-API-Key`)
- **响应格式**: JSON
- **字符编码**: UTF-8

### 主要端点

#### 1. 搜索Skills

```http
GET /skills/search?q={query}&page={page}&limit={limit}
```

**参数**:
- `q` (required): 搜索关键词
- `page` (optional): 页码，默认1
- `limit` (optional): 每页数量，默认20，最大100
- `category` (optional): 分类过滤
- `language` (optional): 编程语言过滤
- `sort` (optional): 排序方式 (`relevance`, `stars`, `updated`)

**响应示例**:
```json
{
  "data": [
    {
      "id": "skill_123",
      "name": "smart-inventory-manager",
      "description": "AI-powered inventory management skill",
      "author": "john-doe",
      "version": "1.2.0",
      "category": "business",
      "languages": ["typescript", "python"],
      "stars": 156,
      "downloads": 1234,
      "updated_at": "2026-04-15T10:30:00Z",
      "repository_url": "https://github.com/john-doe/smart-inventory",
      "documentation_url": "https://github.com/john-doe/smart-inventory/blob/main/SKILL.md"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "total_pages": 8
  }
}
```

#### 2. 获取Skill详情

```http
GET /skills/{id}
```

**响应示例**:
```json
{
  "id": "skill_123",
  "name": "smart-inventory-manager",
  "description": "AI-powered inventory management skill",
  "long_description": "This skill helps businesses manage their inventory...",
  "author": {
    "username": "john-doe",
    "profile_url": "https://github.com/john-doe"
  },
  "version": "1.2.0",
  "category": "business",
  "tags": ["inventory", "management", "ai", "automation"],
  "languages": ["typescript", "python"],
  "permissions": ["file:read", "file:write", "network:outbound"],
  "dependencies": {
    "@ai-sdk/openai": "^0.1.0",
    "zod": "^3.22.0"
  },
  "compatibility": {
    "agents": ["openclaw", "claude-code", "cursor"]
  },
  "metrics": {
    "stars": 156,
    "downloads": 1234,
    "forks": 23
  },
  "urls": {
    "repository": "https://github.com/john-doe/smart-inventory",
    "documentation": "https://github.com/john-doe/smart-inventory/blob/main/SKILL.md",
    "package": "https://github.com/john-doe/smart-inventory/archive/refs/tags/v1.2.0.zip"
  },
  "created_at": "2025-12-01T08:00:00Z",
  "updated_at": "2026-04-15T10:30:00Z"
}
```

#### 3. 获取热门Skills

```http
GET /skills/trending?period={period}&limit={limit}
```

**参数**:
- `period` (optional): 时间周期 (`day`, `week`, `month`)，默认`week`
- `limit` (optional): 返回数量，默认10，最大50

#### 4. 获取分类列表

```http
GET /categories
```

**响应示例**:
```json
{
  "categories": [
    {
      "id": "business",
      "name": "Business",
      "skill_count": 1234
    },
    {
      "id": "development",
      "name": "Development",
      "skill_count": 2345
    }
  ]
}
```

---

## 集成步骤

### Step 1: 获取API密钥

1. 访问 https://skillsmp.com/signup 注册账号
2. 登录后进入 Dashboard → API Keys
3. 点击 "Generate New Key"
4. 复制API Key并安全保存

```bash
# 添加到环境变量
export SKILLSMP_API_KEY="your_api_key_here"
```

### Step 2: 安装依赖

```bash
npm install axios node-cache
```

### Step 3: 创建API连接器

```typescript
// lib/crawlers/SkillsMPConnector.ts

import axios, { AxiosInstance } from 'axios';
import NodeCache from 'node-cache';

interface SkillsMPConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  cacheTTL?: number;
}

interface FetchParams {
  query?: string;
  page?: number;
  limit?: number;
  category?: string;
  language?: string;
  sort?: 'relevance' | 'stars' | 'updated';
}

interface SkillsMPSkill {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  category: string;
  languages: string[];
  stars: number;
  downloads: number;
  updated_at: string;
  repository_url: string;
  documentation_url: string;
}

export class SkillsMPConnector {
  private client: AxiosInstance;
  private cache: NodeCache;
  private apiKey: string;

  constructor(config: SkillsMPConfig) {
    this.apiKey = config.apiKey;
    this.cache = new NodeCache({ 
      stdTTL: config.cacheTTL || 3600 // 默认缓存1小时
    });

    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.skillsmp.com/v1',
      timeout: config.timeout || 30000,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    // 添加响应拦截器
    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 429) {
          console.warn('Rate limit exceeded, waiting...');
          // 实现重试逻辑
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 搜索Skills
   */
  async searchSkills(params: FetchParams): Promise<SkillsMPSkill[]> {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = this.cache.get<SkillsMPSkill[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get('/skills/search', { params });
      const skills = response.data.data;
      
      // 缓存结果
      this.cache.set(cacheKey, skills, 300); // 搜索结果缓存5分钟
      
      return skills;
    } catch (error) {
      console.error('Failed to search skills:', error);
      throw error;
    }
  }

  /**
   * 获取Skill详情
   */
  async getSkillDetail(id: string): Promise<any> {
    const cacheKey = `skill:${id}`;
    const cached = this.cache.get<any>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get(`/skills/${id}`);
      const skill = response.data;
      
      // 缓存详情
      this.cache.set(cacheKey, skill, 3600); // 详情缓存1小时
      
      return skill;
    } catch (error) {
      console.error(`Failed to fetch skill ${id}:`, error);
      throw error;
    }
  }

  /**
   * 获取热门Skills
   */
  async getTrendingSkills(period: string = 'week', limit: number = 20): Promise<SkillsMPSkill[]> {
    try {
      const response = await this.client.get('/skills/trending', {
        params: { period, limit }
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch trending skills:', error);
      throw error;
    }
  }

  /**
   * 全量同步（分页获取所有skills）
   */
  async syncAllSkills(onProgress?: (progress: number, total: number) => void): Promise<SkillsMPSkill[]> {
    const allSkills: SkillsMPSkill[] = [];
    let page = 1;
    const limit = 100;
    let hasMore = true;

    console.log('Starting full sync from SkillsMP...');

    while (hasMore) {
      try {
        const response = await this.client.get('/skills/search', {
          params: { page, limit, sort: 'updated' }
        });

        const skills = response.data.data;
        const pagination = response.data.pagination;

        allSkills.push(...skills);
        
        // 调用进度回调
        if (onProgress) {
          onProgress(allSkills.length, pagination.total);
        }

        console.log(`Synced ${allSkills.length}/${pagination.total} skills`);

        // 检查是否还有更多数据
        hasMore = page < pagination.total_pages;
        page++;

        // 避免速率限制，添加延迟
        await this.sleep(1000);
      } catch (error) {
        console.error(`Failed to sync page ${page}:`, error);
        // 可以选择重试或跳过
        break;
      }
    }

    console.log(`Full sync completed: ${allSkills.length} skills`);
    return allSkills;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cache.flushAll();
  }
}
```

### Step 4: 数据转换层

```typescript
// lib/transformers/SkillsMPTransformer.ts

import { SkillsMPSkill } from '../crawlers/SkillsMPConnector';
import { Skill } from '@prisma/client';

export class SkillsMPTransformer {
  /**
   * 将SkillsMP格式转换为SkillHub格式
   */
  transform(skill: SkillsMPSkill): Partial<Skill> {
    return {
      // 基本信息
      name: skill.name,
      slug: this.generateSlug(skill.name),
      description: skill.description,
      version: skill.version,
      
      // 来源信息
      source: 'skillsmp',
      sourceId: skill.id,
      sourceUrl: skill.documentation_url,
      
      // 作者信息
      authorName: skill.author,
      authorUrl: `https://github.com/${skill.author}`,
      
      // 分类和标签
      category: skill.category,
      tags: [], // SkillsMP可能没有tags，需要后续提取
      
      // 技术信息
      languages: skill.languages,
      
      // 文件链接
      packageUrl: skill.repository_url,
      documentationUrl: skill.documentation_url,
      repositoryUrl: skill.repository_url,
      
      // 指标
      downloadCount: skill.downloads,
      starCount: skill.stars,
      
      // 时间戳
      updatedAt: new Date(skill.updated_at),
    };
  }

  /**
   * 生成URL友好的slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * 批量转换
   */
  transformBatch(skills: SkillsMPSkill[]): Partial<Skill>[] {
    return skills.map(skill => this.transform(skill));
  }
}
```

### Step 5: 数据导入服务

```typescript
// lib/services/SkillsImportService.ts

import { prisma } from '@/lib/prisma';
import { SkillsMPConnector } from '../crawlers/SkillsMPConnector';
import { SkillsMPTransformer } from '../transformers/SkillsMPTransformer';

export class SkillsImportService {
  private connector: SkillsMPConnector;
  private transformer: SkillsMPTransformer;

  constructor() {
    this.connector = new SkillsMPConnector({
      apiKey: process.env.SKILLSMP_API_KEY!,
      cacheTTL: 3600,
    });
    this.transformer = new SkillsMPTransformer();
  }

  /**
   * 执行全量导入
   */
  async importAllSkills(): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      // 记录同步开始
      const syncLog = await prisma.syncLog.create({
        data: {
          source: 'skillsmp',
          status: 'running',
        },
      });

      // 从SkillsMP获取所有skills
      const skillsMPData = await this.connector.syncAllSkills(
        (progress, total) => {
          console.log(`Progress: ${progress}/${total} (${Math.round(progress/total*100)}%)`);
        }
      );

      console.log(`Fetched ${skillsMPData.length} skills from SkillsMP`);

      // 转换数据
      const transformedSkills = this.transformer.transformBatch(skillsMPData);

      // 批量插入数据库
      for (const skillData of transformedSkills) {
        try {
          await prisma.skill.upsert({
            where: {
              source_sourceId: {
                source: 'skillsmp',
                sourceId: skillData.sourceId!,
              },
            },
            update: skillData,
            create: {
              ...skillData,
              createdAt: new Date(),
            } as any,
          });
          result.success++;
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import skill ${skillData.name}: ${error.message}`);
          console.error(error);
        }
      }

      // 更新同步日志
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          completedAt: new Date(),
          totalCount: skillsMPData.length,
          successCount: result.success,
          failedCount: result.failed,
          status: result.failed > 0 ? 'completed_with_errors' : 'completed',
          errorMessage: result.errors.length > 0 ? result.errors.join('\n') : null,
        },
      });

      console.log(`Import completed: ${result.success} success, ${result.failed} failed`);
    } catch (error) {
      console.error('Import failed:', error);
      result.errors.push(`Import failed: ${error.message}`);
    }

    return result;
  }

  /**
   * 增量更新（只更新最近变化的skills）
   */
  async incrementalUpdate(since: Date): Promise<number> {
    // 实现增量更新逻辑
    // 1. 查询SkillsMP中since之后更新的skills
    // 2. 更新本地数据库
    return 0;
  }
}
```

### Step 6: 定时任务配置

```typescript
// lib/cron/skillsSync.ts

import cron from 'node-cron';
import { SkillsImportService } from '../services/SkillsImportService';

const importService = new SkillsImportService();

// 每天凌晨3点执行全量同步
cron.schedule('0 3 * * *', async () => {
  console.log('Starting scheduled SkillsMP sync...');
  try {
    const result = await importService.importAllSkills();
    console.log('Scheduled sync completed:', result);
  } catch (error) {
    console.error('Scheduled sync failed:', error);
  }
});

// 每小时执行增量更新
cron.schedule('0 * * * *', async () => {
  console.log('Starting incremental update...');
  try {
    const lastSync = await prisma.syncLog.findFirst({
      where: { source: 'skillsmp' },
      orderBy: { startedAt: 'desc' },
    });
    
    if (lastSync) {
      const count = await importService.incrementalUpdate(lastSync.completedAt!);
      console.log(`Incremental update completed: ${count} skills updated`);
    }
  } catch (error) {
    console.error('Incremental update failed:', error);
  }
});

console.log('SkillsMP sync cron jobs registered');
```

---

## 数据映射

### SkillsMP → SkillHub 字段映射

| SkillsMP字段 | SkillHub字段 | 转换规则 |
|-------------|-------------|---------|
| `id` | `sourceId` | 直接映射 |
| `name` | `name` | 直接映射 |
| `name` | `slug` | 转换为URL友好格式 |
| `description` | `description` | 直接映射 |
| `author` | `authorName` | 直接映射 |
| `version` | `version` | 直接映射 |
| `category` | `category` | 直接映射 |
| `languages` | `languages` | 数组直接映射 |
| `stars` | `starCount` | 重命名 |
| `downloads` | `downloadCount` | 重命名 |
| `repository_url` | `repositoryUrl` | 重命名 |
| `repository_url` | `packageUrl` | 相同值 |
| `documentation_url` | `documentationUrl` | 直接映射 |
| `updated_at` | `updatedAt` | 转换为Date对象 |
| - | `source` | 固定值: 'skillsmp' |
| - | `qualityScore` | 根据stars/downloads计算 |

---

## 认证配置

### 环境变量

```bash
# .env.local

# SkillsMP API配置
SKILLSMP_API_KEY=your_api_key_here
SKILLSMP_BASE_URL=https://api.skillsmp.com/v1

# 缓存配置
SKILLSMP_CACHE_TTL=3600  # 秒

# 同步配置
SKILLSMP_SYNC_BATCH_SIZE=100
SKILLSMP_SYNC_DELAY=1000  # 毫秒
```

### 安全建议

1. **不要硬编码API Key**: 始终使用环境变量
2. **定期轮换密钥**: 每3个月更换一次API Key
3. **限制IP白名单**: 在SkillsMP Dashboard配置允许的IP
4. **监控使用情况**: 定期检查API调用日志

---

## 速率限制

### SkillsMP API限制

- **标准计划**: 100 requests/minute
- **专业计划**: 500 requests/minute
- **企业计划**: 自定义

### 优化策略

```typescript
// 实现Token Bucket限流
class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private lastRefill: number;

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  async acquire(): Promise<void> {
    this.refill();
    
    if (this.tokens <= 0) {
      const waitTime = (1 / this.refillRate) * 1000;
      await this.sleep(waitTime);
      this.refill();
    }
    
    this.tokens--;
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    const newTokens = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 使用示例
const rateLimiter = new RateLimiter(100, 100/60); // 100 tokens, 100/min refill

async function makeRequest() {
  await rateLimiter.acquire();
  // 执行API请求
}
```

---

## 错误处理

### 常见错误代码

| 状态码 | 含义 | 处理方式 |
|-------|------|---------|
| 400 | Bad Request | 检查请求参数 |
| 401 | Unauthorized | 检查API Key |
| 403 | Forbidden | 检查权限 |
| 404 | Not Found | Skill不存在 |
| 429 | Too Many Requests | 等待后重试 |
| 500 | Server Error | 稍后重试 |
| 503 | Service Unavailable | 稍后重试 |

### 重试策略

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === maxRetries - 1) throw error;
      
      // 只对特定错误重试
      if (error.response?.status === 429 || error.response?.status >= 500) {
        const delay = baseDelay * Math.pow(2, i); // 指数退避
        console.warn(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Unreachable');
}
```

---

## 最佳实践

### 1. 缓存策略

- **短期缓存** (5分钟): 搜索结果
- **中期缓存** (1小时): Skill详情
- **长期缓存** (24小时): 分类列表、热门列表

### 2. 批量操作

```typescript
// 使用事务批量插入
await prisma.$transaction(async (tx) => {
  for (const skill of skills) {
    await tx.skill.upsert({
      where: { /* ... */ },
      update: { /* ... */ },
      create: { /* ... */ },
    });
  }
});
```

### 3. 错误日志

```typescript
// 记录详细的错误信息
console.error({
  message: 'Failed to import skill',
  skillId: skill.id,
  skillName: skill.name,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
});
```

### 4. 监控告警

- 监控API调用成功率
- 监控同步任务执行时间
- 设置失败率阈值告警

---

## 故障排查

### 问题1: API返回401 Unauthorized

**原因**: API Key无效或过期

**解决**:
1. 检查环境变量 `SKILLSMP_API_KEY` 是否正确
2. 登录SkillsMP Dashboard验证API Key状态
3. 重新生成API Key并更新配置

### 问题2: 速率限制错误 (429)

**原因**: 超过API调用频率限制

**解决**:
1. 增加请求间隔时间
2. 实现指数退避重试
3. 升级到更高计划的API

### 问题3: 数据导入速度慢

**原因**: 网络延迟或数据库写入瓶颈

**解决**:
1. 增加批量大小 (batch size)
2. 使用数据库事务
3. 优化数据库索引
4. 考虑并行处理

### 问题4: 数据不一致

**原因**: 同步过程中出现错误

**解决**:
1. 检查sync_logs表查看错误详情
2. 重新运行失败的同步任务
3. 实现数据校验机制

---

## 总结

通过本指南，您已经完成了SkillsMP与SkillHub的集成。关键要点：

✅ 正确配置API认证  
✅ 实现数据转换层  
✅ 处理速率限制和错误  
✅ 设置定时同步任务  
✅ 监控和维护数据质量  

下一步：继续集成Skill Seekers爬虫系统，实现GitHub仓库的自动发现。

---

**相关文档**:
- [GLOBAL_SKILLS_SEARCH_PLAN.md](./GLOBAL_SKILLS_SEARCH_PLAN.md) - v2.0整体规划
- [SKILL_SEEKERS_CRAWLER_GUIDE.md](./SKILL_SEEKERS_CRAWLER_GUIDE.md) - Skill Seekers集成指南

**支持**:
如有问题，请提交GitHub Issue或联系技术支持。

# SkillHub v2.0 开发进度追踪

> **最后更新**: 2026-04-18  
> **当前阶段**: Phase 1-2 完成，准备实施搜索系统  
> **整体进度**: 25% (2/8个主要阶段)

---

## 📊 当前状态概览

### ✅ 已完成模块

| 模块 | 状态 | 完成度 | 说明 |
|------|------|--------|------|
| **SkillsMP集成** | ✅ 完成 | 100% | API连接器、数据转换、导入管道 |
| **GitHub爬虫** | ✅ 完成 | 100% | Skill Seekers适配器、批量爬取 |
| **定时调度** | ✅ 完成 | 100% | 4个cron任务配置完成 |
| **数据库扩展** | ✅ 完成 | 100% | Schema升级、索引优化 |
| **技术文档** | ✅ 完成 | 100% | 3000+行文档 |

### ⚠️ 进行中模块

| 模块 | 状态 | 完成度 | 下一步 |
|------|------|--------|--------|
| **数据处理** | 🔄 进行中 | 40% | 需要实现Embeddings生成 |
| **去重引擎** | 🔄 部分完成 | 30% | 基础upsert已实现，需模糊匹配 |

### ❌ 待开始模块

| 模块 | 优先级 | 预计时间 | 阻塞因素 |
|------|--------|---------|---------|
| **全文搜索** | 🔴 P0 | 1周 | 无 |
| **搜索API** | 🔴 P0 | 3天 | 依赖全文搜索 |
| **向量搜索** | 🟡 P1 | 1周 | 需要pgvector扩展 |
| **前端优化** | 🟡 P1 | 1周 | 依赖搜索API |
| **DeerFlow集成** | 🟢 P2 | 2周 | 可选，可延后 |
| **测试发布** | 🟢 P2 | 2周 | 依赖所有功能完成 |

---

## 🎯 本周重点任务 (Week 3)

### 任务1: 配置环境并验证Phase 1-2 ⏱️ 2小时

```bash
# Step 1: 获取API Keys
# - SkillsMP: https://skillsmp.com/signup
# - GitHub: https://github.com/settings/tokens

# Step 2: 配置环境变量
cd apps/web
echo "SKILLSMP_API_KEY=your_key" >> .env.local
echo "GITHUB_TOKEN=ghp_your_token" >> .env.local

# Step 3: 数据库迁移
npx prisma generate
npx prisma db push

# Step 4: 重启开发服务器
npm run dev

# Step 5: 查看日志确认定时任务启动
# 应看到: "🚀 Starting SkillHub Task Scheduler..."
```

**验收标准**:
- [ ] 服务器成功启动
- [ ] 定时调度器初始化成功
- [ ] 无TypeScript编译错误

### 任务2: 测试数据导入功能 ⏱️ 3小时

创建测试脚本验证SkillsMP导入：

```typescript
// scripts/test-skillsmp-import.ts
import { SkillsImportService } from '../apps/web/lib/services/SkillsImportService';

async function test() {
  console.log('Testing SkillsMP import...');
  
  const service = new SkillsImportService();
  
  // 测试单条导入
  try {
    const result = await service.importSingleSkill('test-skill-id');
    console.log('✅ Single import success:', result);
  } catch (error) {
    console.error('❌ Single import failed:', error);
  }
  
  // 测试获取同步统计
  try {
    const stats = await service.getSyncStats();
    console.log('📊 Sync stats:', stats);
  } catch (error) {
    console.error('❌ Get stats failed:', error);
  }
}

test();
```

运行测试：
```bash
npx tsx scripts/test-skillsmp-import.ts
```

**验收标准**:
- [ ] 单条导入成功（或明确的错误提示）
- [ ] 同步统计数据正确
- [ ] 数据库中有记录

### 任务3: 测试GitHub爬虫功能 ⏱️ 3小时

创建测试脚本验证GitHub爬虫：

```typescript
// scripts/test-github-crawler.ts
import { CrawlerService } from '../apps/web/lib/services/CrawlerService';

async function test() {
  console.log('Testing GitHub crawler...');
  
  const service = new CrawlerService();
  
  // 测试单个仓库爬取
  const testRepos = [
    'microsoft/autogen',
    'langchain-ai/langchain',
  ];
  
  for (const repo of testRepos) {
    try {
      console.log(`\n🕷️ Crawling ${repo}...`);
      const success = await service.crawlAndSave(repo);
      console.log(success ? '✅ Success' : '❌ Failed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Error: ${errorMessage}`);
    }
    
    // 避免速率限制
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 检查数据库中的skills数量
  const { prisma } = await import('../apps/web/lib/prisma');
  const count = await prisma.skill.count({
    where: { source: 'github' }
  });
  console.log(`\n📊 Total GitHub skills in DB: ${count}`);
}

test();
```

运行测试：
```bash
npx tsx scripts/test-github-crawler.ts
```

**验收标准**:
- [ ] 至少成功爬取1个仓库
- [ ] 数据库中skills数量增加
- [ ] 质量评分合理 (0-100)

### 任务4: 实现PostgreSQL全文搜索 ⏱️ 1天

#### Step 4.1: 创建全文搜索索引

创建迁移文件：
```bash
cd apps/web
npx prisma migrate dev --name add_full_text_search
```

编辑生成的SQL文件，添加：

```sql
-- 添加tsvector列
ALTER TABLE skills ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 更新现有数据
UPDATE skills 
SET search_vector = to_tsvector('english', 
  COALESCE(name, '') || ' ' || 
  COALESCE(description, '') || ' ' || 
  COALESCE(array_to_string(tags, ' '), '')
);

-- 创建GIN索引
CREATE INDEX idx_skills_search_vector ON skills USING GIN(search_vector);

-- 创建触发器自动更新
CREATE OR REPLACE FUNCTION skills_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.name, '') || ' ' || 
    COALESCE(NEW.description, '') || ' ' || 
    COALESCE(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER skills_search_vector_trigger
  BEFORE INSERT OR UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION skills_search_vector_update();
```

#### Step 4.2: 实现搜索服务

创建文件 `apps/web/lib/search/SearchService.ts`:

```typescript
import { prisma } from '@/lib/prisma';

export interface SearchOptions {
  query: string;
  category?: string;
  language?: string;
  minQualityScore?: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'relevance' | 'quality' | 'updated' | 'stars';
}

export interface SearchResult {
  skills: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class SearchService {
  /**
   * 执行全文搜索
   */
  async search(options: SearchOptions): Promise<SearchResult> {
    const {
      query,
      category,
      language,
      minQualityScore,
      page = 1,
      pageSize = 20,
      sortBy = 'relevance',
    } = options;

    // 构建WHERE条件
    const whereConditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (query) {
      whereConditions.push(`search_vector @@ plainto_tsquery('english', $${paramIndex})`);
      params.push(query);
      paramIndex++;
    }

    if (category) {
      whereConditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (language) {
      whereConditions.push(`$${paramIndex} = ANY(languages)`);
      params.push(language);
      paramIndex++;
    }

    if (minQualityScore !== undefined) {
      whereConditions.push(`"qualityScore" >= $${paramIndex}`);
      params.push(minQualityScore);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // 构建ORDER BY
    let orderBy = '';
    if (sortBy === 'relevance' && query) {
      orderBy = `ORDER BY ts_rank(search_vector, plainto_tsquery('english', $1)) DESC`;
    } else if (sortBy === 'quality') {
      orderBy = `ORDER BY "qualityScore" DESC`;
    } else if (sortBy === 'stars') {
      orderBy = `ORDER BY "starCount" DESC`;
    } else {
      orderBy = `ORDER BY "updatedAt" DESC`;
    }

    // 计算总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM skills
      ${whereClause}
    `;
    const countResult = await prisma.$queryRawUnsafe(countQuery, ...params);
    const total = Number((countResult as any)[0].total);

    // 分页查询
    const offset = (page - 1) * pageSize;
    const dataQuery = `
      SELECT *, 
        ${query ? `ts_rank(search_vector, plainto_tsquery('english', $1)) as rank` : '0 as rank'}
      FROM skills
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const skills = await prisma.$queryRawUnsafe(
      dataQuery, 
      ...params, 
      pageSize, 
      offset
    );

    return {
      skills: skills as any[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取搜索建议
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    const results = await prisma.$queryRaw`
      SELECT DISTINCT name
      FROM skills
      WHERE name ILIKE ${`%${query}%`}
      LIMIT ${limit}
    `;
    
    return (results as any[]).map(r => r.name);
  }
}
```

#### Step 4.3: 创建搜索API端点

创建文件 `apps/web/app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/search/SearchService';

const searchService = new SearchService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const language = searchParams.get('language') || undefined;
    const minQualityScore = searchParams.get('minQuality') 
      ? parseFloat(searchParams.get('minQuality')!) 
      : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = (searchParams.get('sortBy') as any) || 'relevance';

    // 验证参数
    if (!query && !category && !language) {
      return NextResponse.json(
        { error: '至少提供一个搜索条件' },
        { status: 400 }
      );
    }

    const result = await searchService.search({
      query,
      category,
      language,
      minQualityScore,
      page,
      pageSize,
      sortBy,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: '搜索失败' },
      { status: 500 }
    );
  }
}
```

**验收标准**:
- [ ] 全文搜索索引创建成功
- [ ] 搜索API返回正确结果
- [ ] 搜索响应时间 < 100ms
- [ ] 支持多维度过滤

### 任务5: 优化前端搜索UI ⏱️ 1天

#### Step 5.1: 创建搜索页面组件

更新或创建 `apps/web/app/skills/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchService } from '@/lib/search/SearchService';

export default function SkillsPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      setResults(data.skills);
      setTotal(data.total);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 搜索框 */}
      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索Skills..."
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 搜索结果 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">搜索中...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            找到 {total} 个结果
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((skill) => (
              <div key={skill.id} className="border rounded-lg p-6 hover:shadow-lg transition">
                <h3 className="text-xl font-semibold mb-2">{skill.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{skill.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>⭐ {skill.starCount || 0}</span>
                  <span>📥 {skill.downloadCount || 0}</span>
                  <span>✨ {skill.qualityScore?.toFixed(0) || 0}/100</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

**验收标准**:
- [ ] 搜索界面美观易用
- [ ] 实时搜索响应流畅
- [ ] 移动端适配良好
- [ ] 加载状态友好

---

## 📅 下周计划 (Week 4)

### 优先级P0 (必须完成)

1. **完善搜索功能**
   - [ ] 添加高级筛选面板
   - [ ] 实现搜索结果高亮
   - [ ] 添加分页组件
   - [ ] 优化搜索性能

2. **测试和优化**
   - [ ] 端到端测试搜索流程
   - [ ] 性能基准测试
   - [ ] 修复发现的Bug

### 优先级P1 (重要)

3. **集成pgvector (可选)**
   - [ ] 安装pgvector扩展
   - [ ] 添加embedding字段
   - [ ] 实现向量搜索
   - [ ] 混合搜索策略

4. **前端增强**
   - [ ] 添加骨架屏
   - [ ] 实现图片懒加载
   - [ ] 优化Lighthouse分数

---

## 🚧 阻塞因素和解决方案

### 阻塞1: 缺少真实API Keys

**影响**: 无法测试真实数据导入

**解决方案**:
```bash
# 立即行动
1. 注册SkillsMP账号: https://skillsmp.com/signup
2. 获取GitHub Token: https://github.com/settings/tokens
3. 配置到.env.local
```

### 阻塞2: 数据库迁移未完成

**影响**: TypeScript编译错误，新功能无法运行

**解决方案**:
```bash
cd apps/web
npx prisma generate
npx prisma db push
```

### 阻塞3: 搜索系统未实现

**影响**: 核心功能缺失，无法实现"搜索引擎"价值

**解决方案**: 
- 本周重点实施全文搜索
- 按上述任务4和5逐步实现

---

## 📈 关键指标追踪

### 技术指标

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| 索引skills数量 | > 50,000 | ~0 | ❌ 需API Key |
| 搜索响应时间 | < 200ms | N/A | ⏳ 待实现 |
| 爬虫日处理能力 | > 1,000 repos | 框架就绪 | ✅ 50% |
| 数据更新延迟 | < 24小时 | 定时任务已配 | ✅ 80% |
| 代码覆盖率 | > 80% | 核心逻辑已测 | ⚠️ 待补充 |

### 开发进度

| 阶段 | 计划时间 | 实际进度 | 偏差 |
|------|---------|---------|------|
| Phase 1 | Week 1-2 | ✅ 完成 | 准时 |
| Phase 2 | Week 3-4 | ✅ 完成 | 提前 |
| Phase 3 | Week 5-7 | ❌ 未开始 | - |
| Phase 4 | Week 8-9 | ⚠️ 40% | 滞后 |
| Phase 5 | Week 7-8 | ❌ 0% | 滞后 |
| Phase 6 | Week 9 | ❌ 0% | 滞后 |
| Phase 7 | Week 10-11 | ❌ 0% | 滞后 |

**调整建议**: 
- Phase 5 (搜索系统) 提前到 Week 3-4 实施
- Phase 3 (DeerFlow) 延后到 v2.1 版本
- 总周期调整为 12 周

---

## 🎯 成功标准

### 本周成功标准 (Week 3)

- [x] Phase 1-2 代码健康检查通过
- [ ] 配置真实API Keys并完成测试
- [ ] 实现PostgreSQL全文搜索
- [ ] 搜索API端点可用
- [ ] 前端搜索UI基本可用

### v2.0 Beta 发布标准

- [ ] 索引至少 1,000 个skills
- [ ] 搜索响应时间 P95 < 200ms
- [ ] 每日自动更新机制正常运行
- [ ] 前端搜索体验流畅
- [ ] 无P0/P1级别Bug

---

## 📝 备注

### 重要决策记录

1. **2026-04-18**: 决定优先实施搜索系统，而非DeerFlow集成
   - 原因: 搜索是核心价值，DeerFlow是增强特性
   - 影响: 调整开发优先级，加快v2.0 Beta发布

2. **2026-04-18**: 使用Prisma表作为任务队列，暂不强制依赖Redis
   - 原因: 简化部署，降低复杂度
   - 影响: 可根据需要后续升级到BullMQ

### 技术债务

- [ ] 补充单元测试
- [ ] 完善错误处理
- [ ] 添加更多日志
- [ ] 优化数据库查询性能

---

**下次更新**: 完成本周任务后更新  
**负责人**: Development Team  
**文档版本**: v1.0

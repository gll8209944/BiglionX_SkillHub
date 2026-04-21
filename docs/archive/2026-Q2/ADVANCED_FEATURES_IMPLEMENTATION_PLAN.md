# Skills 高级功能实现计划

## 📋 概述

本文档详细说明Skills系统的四个高级功能实现方案：
1. ✅ 子分类支持 - 为AI/ML等大类添加二级分类
2. ⏳ 用户反馈 - 允许纠正错误分类
3. ⏳ 趋势分析 - 热门分类排行榜
4. ⏳ 智能推荐 - 基于浏览历史的推荐

---

## 1️⃣ 子分类支持 (Subcategories) ✅ 已完成

### 实现状态
- ✅ SmartClassifier 扩展完成
- ✅ Prisma Schema 更新完成
- ⏳ 数据库迁移待执行
- ⏳ CrawlerService 集成待完成
- ⏳ 前端展示待实现

### 技术实现

#### 1.1 数据模型扩展

**Prisma Schema:**
```prisma
model Skill {
  // ... existing fields
  category      String
  subcategory   String?        // 新增：子分类
  confidence    Float          @default(70)  // 新增：置信度
  // ...
}
```

#### 1.2 分类器增强

**SmartClassifier.ts:**
```typescript
interface ClassificationResult {
  category: string;      // 主分类
  subcategory?: string;  // 子分类（可选）
  confidence: number;    // 置信度 (0-100)
}

class SmartClassifier {
  classify(skill): ClassificationResult {
    // 返回包含子分类和置信度的结果
  }
  
  // AI/ML 子分类
  private getAIMLSubcategory(text): string | undefined {
    // ai_agent, llm_tools, ml_framework, 
    // computer_vision, speech_audio
  }
  
  // Automation 子分类
  private getAutomationSubcategory(text): string | undefined {
    // workflow_automation, rpa_bot, task_scheduling
  }
  
  // Data Analytics 子分类
  private getDataSubcategory(text): string | undefined {
    // database, data_viz, web_scraping
  }
  
  // Web/Mobile 子分类
  private getWebMobileSubcategory(text): string | undefined {
    // mobile_app, frontend, ecommerce
  }
  
  // Development 子分类
  private getDevSubcategory(text): string | undefined {
    // dev_tools, testing, documentation, cli_tools
  }
  
  // 置信度计算
  private calculateConfidence(text, category): number {
    // 基于文本长度、关键词匹配数量等
  }
}
```

#### 1.3 子分类体系

**AI/ML 子分类:**
- `ai_agent` - AI代理框架 (AutoGPT, CrewAI)
- `llm_tools` - LLM工具 (ChatGPT wrappers, prompt tools)
- `ml_framework` - ML框架 (LangChain, LlamaIndex)
- `computer_vision` - 计算机视觉 (Stable Diffusion, image recognition)
- `speech_audio` - 语音处理 (Whisper, TTS)

**Automation 子分类:**
- `workflow_automation` - 工作流自动化 (n8n, Zapier)
- `rpa_bot` - RPA机器人
- `task_scheduling` - 任务调度

**Data Analytics 子分类:**
- `database` - 数据库工具
- `data_viz` - 数据可视化
- `web_scraping` - 网络爬虫

**Web/Mobile 子分类:**
- `mobile_app` - 移动应用
- `frontend` - 前端开发
- `ecommerce` - 电商平台

**Development 子分类:**
- `dev_tools` - 开发工具 (IDE, editors)
- `testing` - 测试工具
- `documentation` - 文档工具
- `cli_tools` - CLI工具

### 下一步操作

1. **执行数据库迁移:**
```bash
cd apps/web
npx prisma migrate dev --name add_subcategory_and_confidence
npx prisma generate
```

2. **更新 CrawlerService:**
```typescript
private transformCrawledToSkillHub(crawled: CrawledSkill) {
  const result = this.classifier.classify({
    name: crawled.name,
    description: crawled.description,
    tags: crawled.tags,
    languages: crawled.languages,
  });
  
  return {
    // ...
    category: result.category,
    subcategory: result.subcategory,  // 新增
    confidence: result.confidence,     // 新增
    // ...
  };
}
```

3. **批量更新现有数据:**
创建脚本重新分类所有现有Skills，填充subcategory和confidence字段。

4. **前端展示:**
```tsx
// Skills 卡片显示
<div className="flex gap-2">
  <Badge>{getCategoryName(skill.category)}</Badge>
  {skill.subcategory && (
    <Badge variant="secondary">
      {getSubcategoryName(skill.subcategory)}
    </Badge>
  )}
  <Badge variant="outline">
    置信度: {skill.confidence}%
  </Badge>
</div>
```

---

## 2️⃣ 用户反馈系统 (User Feedback) ⏳ 待实现

### 功能设计

允许用户对Skills的分类进行反馈：
- 👍 "分类准确"
- 👎 "分类不准确" + 选择正确分类
- 💬 可选的评论说明

### 技术实现

#### 2.1 数据模型

**新增表: SkillClassificationFeedback**
```prisma
model SkillClassificationFeedback {
  id          String   @id @default(uuid())
  skillId     String
  userId      String
  isCorrect   Boolean  // true=准确, false=不准确
  suggestedCategory String?  // 用户建议的分类
  suggestedSubcategory String? // 用户建议的子分类
  comment     String?  // 可选评论
  status      String   @default("pending") // pending, reviewed, applied
  createdAt   DateTime @default(now())
  reviewedAt  DateTime?
  reviewedBy  String?  // 管理员ID
  
  skill       Skill    @relation(fields: [skillId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  
  @@unique([skillId, userId]) // 每个用户对每个技能只能反馈一次
  @@index([status])
  @@map("skill_classification_feedbacks")
}
```

#### 2.2 API 端点

**POST /api/skills/[id]/feedback**
```typescript
// 提交分类反馈
{
  isCorrect: boolean,
  suggestedCategory?: string,
  suggestedSubcategory?: string,
  comment?: string
}
```

**GET /api/admin/feedbacks**
```typescript
// 管理员查看待审核的反馈
query: {
  status: 'pending' | 'reviewed' | 'applied',
  page: number,
  limit: number
}
```

**PATCH /api/admin/feedbacks/[id]**
```typescript
// 管理员审核反馈
{
  status: 'reviewed' | 'applied',
  adminNote?: string
}
```

#### 2.3 前端组件

**FeedbackButton.tsx**
```tsx
interface Props {
  skillId: string;
  currentCategory: string;
  currentSubcategory?: string;
}

export function FeedbackButton({ skillId, currentCategory, currentSubcategory }: Props) {
  const [showDialog, setShowDialog] = useState(false);
  
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => handleFeedback(true)}>
        👍 分类准确
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setShowDialog(true)}>
        👎 分类有误
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>报告分类错误</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <Label>正确的分类:</Label>
            <Select name="category">
              {/* 分类选项 */}
            </Select>
            
            <Label>正确的子分类 (可选):</Label>
            <Select name="subcategory">
              {/* 子分类选项 */}
            </Select>
            
            <Label>说明 (可选):</Label>
            <Textarea name="comment" />
            
            <Button type="submit">提交反馈</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

#### 2.4 自动学习机制

当某个Skill收到足够多的相同反馈时，自动更新分类：

```typescript
// 后台任务：检查并应用反馈
async function processFeedback() {
  // 找到有足够反馈的技能
  const skillsWithFeedback = await prisma.skillClassificationFeedback.groupBy({
    by: ['skillId', 'suggestedCategory', 'suggestedSubcategory'],
    where: {
      isCorrect: false,
      status: 'pending'
    },
    _count: true,
    having: {
      count: { _count: { gte: 5 } } // 至少5个相同反馈
    }
  });
  
  // 自动更新分类
  for (const feedback of skillsWithFeedback) {
    await prisma.skill.update({
      where: { id: feedback.skillId },
      data: {
        category: feedback.suggestedCategory,
        subcategory: feedback.suggestedSubcategory,
      }
    });
    
    // 标记反馈为已应用
    await prisma.skillClassificationFeedback.updateMany({
      where: {
        skillId: feedback.skillId,
        suggestedCategory: feedback.suggestedCategory,
      },
      data: { status: 'applied' }
    });
  }
}
```

---

## 3️⃣ 趋势分析 (Trending Analysis) ⏳ 待实现

### 功能设计

展示热门分类和技能排行榜：
- 🔥 最热门分类（按浏览量/下载量）
- 📈 增长最快的分类
- ⭐ 高分Skills排行榜
- 🆕 最新添加的Skills

### 技术实现

#### 3.1 数据追踪

**新增表: SkillView**
```prisma
model SkillView {
  id        String   @id @default(uuid())
  skillId   String
  userId    String?  // 如果用户登录
  viewedAt  DateTime @default(now())
  ipAddress String?  // 匿名用户的IP
  
  skill     Skill    @relation(fields: [skillId], references: [id])
  
  @@index([skillId])
  @@index([viewedAt])
  @@map("skill_views")
}
```

#### 3.2 统计API

**GET /api/stats/trending-categories**
```typescript
// 获取热门分类（过去7天）
const trendingCategories = await prisma.skill.groupBy({
  by: ['category', 'subcategory'],
  where: {
    views: {
      some: {
        viewedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    }
  },
  _count: {
    views: true
  },
  orderBy: {
    _count: {
      views: 'desc'
    }
  },
  take: 10
});
```

**GET /api/stats/category-growth**
```typescript
// 分类增长率（本周 vs 上周）
const currentWeek = await getViewsByPeriod(7);
const lastWeek = await getViewsByPeriod(7, 7); // 7天前开始

const growth = currentWeek.map(cat => ({
  ...cat,
  growthRate: ((cat.count - lastWeek[cat.category]?.count || 0) / 
               (lastWeek[cat.category]?.count || 1)) * 100
}));
```

#### 3.3 前端展示

**TrendingPage.tsx**
```tsx
export default function TrendingPage() {
  const { data: trending } = useQuery({
    queryKey: ['trending-categories'],
    queryFn: fetchTrendingCategories
  });
  
  return (
    <div className="space-y-8">
      <section>
        <h2>🔥 热门分类 Top 10</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {trending?.map(cat => (
            <Card key={cat.category}>
              <CardHeader>
                <CardTitle>{getCategoryName(cat.category)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{cat._count.views}</div>
                <p className="text-sm text-muted-foreground">次浏览</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      
      <section>
        <h2>📈 增长最快</h2>
        {/* 增长图表 */}
      </section>
      
      <section>
        <h2>⭐ 高分 Skills</h2>
        {/* Skills 排行榜 */}
      </section>
    </div>
  );
}
```

#### 3.4 定时统计任务

使用 BullMQ 定期计算统计数据：

```typescript
// jobs/trendingStats.job.ts
export const trendingStatsJob = {
  name: 'calculate-trending-stats',
  schedule: '0 0 * * *', // 每天午夜
  
  async handler() {
    // 计算过去7天的热门分类
    // 计算增长率
    // 缓存结果到 Redis
  }
};
```

---

## 4️⃣ 智能推荐 (Smart Recommendations) ⏳ 待实现

### 功能设计

基于用户行为提供个性化推荐：
- 🎯 "猜你喜欢" - 基于浏览历史
- 🔗 "相关Skills" - 基于相似性
- 🌟 "为你推荐" - 基于协同过滤

### 技术实现

#### 4.1 用户行为追踪

**新增表: UserBehavior**
```prisma
model UserBehavior {
  id        String         @id @default(uuid())
  userId    String
  skillId   String
  action    BehaviorType   // 'view', 'download', 'favorite', 'share'
  duration  Int?           // 浏览时长（秒）
  timestamp DateTime       @default(now())
  
  user      User           @relation(fields: [userId], references: [id])
  skill     Skill          @relation(fields: [skillId], references: [id])
  
  @@index([userId])
  @@index([skillId])
  @@index([timestamp])
  @@map("user_behaviors")
}

enum BehaviorType {
  VIEW
  DOWNLOAD
  FAVORITE
  SHARE
}
```

#### 4.2 推荐算法

**基于内容的推荐:**
```typescript
async function getContentBasedRecommendations(userId: string, limit = 10) {
  // 1. 获取用户最近浏览的Skills
  const recentViews = await prisma.userBehavior.findMany({
    where: {
      userId,
      action: 'VIEW',
      timestamp: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30天内
      }
    },
    orderBy: { timestamp: 'desc' },
    take: 20,
    include: { skill: true }
  });
  
  // 2. 提取用户偏好的分类和标签
  const preferredCategories = {};
  const preferredTags = {};
  
  recentViews.forEach(({ skill }) => {
    preferredCategories[skill.category] = 
      (preferredCategories[skill.category] || 0) + 1;
    
    skill.tags.forEach(tag => {
      preferredTags[tag] = (preferredTags[tag] || 0) + 1;
    });
  });
  
  // 3. 找到相似的Skills
  const recommendations = await prisma.skill.findMany({
    where: {
      OR: [
        { category: { in: Object.keys(preferredCategories) } },
        { tags: { hasSome: Object.keys(preferredTags) } }
      ],
      id: {
        notIn: recentViews.map(v => v.skillId) // 排除已浏览的
      }
    },
    orderBy: {
      downloadCount: 'desc'
    },
    take: limit
  });
  
  return recommendations;
}
```

**协同过滤推荐:**
```typescript
async function getCollaborativeRecommendations(userId: string, limit = 10) {
  // 1. 找到与当前用户有相似行为的用户
  const similarUsers = await findSimilarUsers(userId);
  
  // 2. 获取这些用户喜欢但当前用户未看到的Skills
  const recommendations = await prisma.skill.findMany({
    where: {
      downloads: {
        some: {
          userId: { in: similarUsers }
        }
      },
      id: {
        notIn: await getUserViewedSkills(userId)
      }
    },
    orderBy: {
      downloadCount: 'desc'
    },
    take: limit
  });
  
  return recommendations;
}
```

#### 4.3 推荐API

**GET /api/recommendations/personalized**
```typescript
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return new Response('Unauthorized', { status: 401 });
  
  const [contentBased, collaborative] = await Promise.all([
    getContentBasedRecommendations(session.user.id),
    getCollaborativeRecommendations(session.user.id)
  ]);
  
  // 混合推荐结果
  const mixed = mixRecommendations(contentBased, collaborative);
  
  return NextResponse.json(mixed);
}
```

**GET /api/skills/[id]/related**
```typescript
// 获取相关Skills（基于相似度）
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const skill = await prisma.skill.findUnique({
    where: { id: params.id }
  });
  
  const related = await prisma.skill.findMany({
    where: {
      AND: [
        { id: { not: params.id } },
        {
          OR: [
            { category: skill.category },
            { subcategory: skill.subcategory },
            { tags: { hasSome: skill.tags } }
          ]
        }
      ]
    },
    orderBy: {
      qualityScore: 'desc'
    },
    take: 5
  });
  
  return NextResponse.json(related);
}
```

#### 4.4 前端组件

**PersonalizedRecommendations.tsx**
```tsx
export function PersonalizedRecommendations() {
  const { data: recommendations } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchPersonalizedRecommendations,
    enabled: !!session // 仅登录用户
  });
  
  if (!recommendations?.length) return null;
  
  return (
    <section>
      <h2>🎯 为你推荐</h2>
      <SkillGrid skills={recommendations} />
    </section>
  );
}
```

**RelatedSkills.tsx**
```tsx
export function RelatedSkills({ skillId }: { skillId: string }) {
  const { data: related } = useQuery({
    queryKey: ['related-skills', skillId],
    queryFn: () => fetchRelatedSkills(skillId)
  });
  
  if (!related?.length) return null;
  
  return (
    <section>
      <h2>🔗 相关 Skills</h2>
      <SkillList skills={related} compact />
    </section>
  );
}
```

---

## 📅 实施路线图

### Phase 1: 子分类支持 (1-2天) ✅ 进行中
- [x] SmartClassifier 扩展
- [x] Prisma Schema 更新
- [ ] 数据库迁移
- [ ] CrawlerService 集成
- [ ] 批量更新现有数据
- [ ] 前端展示优化

### Phase 2: 用户反馈 (3-5天)
- [ ] 数据模型设计
- [ ] API 端点实现
- [ ] 前端反馈组件
- [ ] 管理员审核界面
- [ ] 自动学习机制

### Phase 3: 趋势分析 (2-3天)
- [ ] 行为追踪表
- [ ] 统计算法
- [ ] 定时任务
- [ ] 趋势页面
- [ ] 数据可视化

### Phase 4: 智能推荐 (5-7天)
- [ ] 用户行为追踪
- [ ] 推荐算法实现
- [ ] 推荐API
- [ ] 前端推荐组件
- [ ] A/B测试框架

---

## 🎯 预期效果

### 用户体验提升
1. **更精准的导航** - 子分类帮助用户快速定位
2. **参与感** - 用户可以贡献改进分类
3. **发现新内容** - 趋势分析展示热门内容
4. **个性化体验** - 智能推荐提高转化率

### 业务价值
1. **提高留存** - 个性化推荐增加用户粘性
2. **数据驱动** - 反馈系统提供改进依据
3. **社区建设** - 用户参与增强社区感
4. **竞争优势** - 智能功能差异化

---

## 📝 技术栈

- **后端**: Next.js API Routes, Prisma, PostgreSQL
- **任务队列**: BullMQ, Redis
- **缓存**: Redis (推荐结果缓存)
- **前端**: React Query, TailwindCSS, Shadcn UI
- **数据分析**: 自定义SQL查询，未来可集成Apache Spark

---

## 🔗 相关文档

- [智能分类优化报告](./SMART_CLASSIFICATION_OPTIMIZATION.md)
- [SkillsMP集成指南](./docs/SKILLSMP_INTEGRATION_GUIDE.md)
- [DeerFlow集成指南](./docs/DEERFLOW_INTEGRATION_GUIDE.md)

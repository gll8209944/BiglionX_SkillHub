# pgvector 替代方案

## 问题说明

经过验证，**Neon数据库当前不支持pgvector扩展**。这意味着我们无法在现有的Neon数据库中直接使用向量搜索功能。

## 替代方案

### 方案1: 迁移到Supabase (推荐) ⭐

**优势**:
- ✅ 原生支持pgvector
- ✅ 免费层足够使用
- ✅ 与PostgreSQL完全兼容
- ✅ 易于迁移

**实施步骤**:
1. 注册Supabase账号: https://supabase.com
2. 创建新项目
3. 启用pgvector扩展
4. 迁移数据从Neon到Supabase
5. 更新DATABASE_URL环境变量

**预计时间**: 2-3小时

---

### 方案2: 使用外部向量数据库

#### 选项A: Pinecone
- 专门的向量数据库服务
- 高性能、可扩展
- 免费层: 2GB存储

#### 选项B: Weaviate
- 开源向量数据库
- 可自托管或使用云服务
- 强大的语义搜索功能

#### 选项C: Qdrant
- Rust编写的高性能向量数据库
- 提供云服务和自托管选项
- 优秀的API设计

**优势**:
- ✅ 专业的向量搜索性能
- ✅ 可扩展性强
- ✅ 不依赖PostgreSQL

**劣势**:
- ❌ 需要维护额外的数据库
- ❌ 增加系统复杂性
- ❌ 额外的成本

**预计时间**: 4-6小时

---

### 方案3: 仅使用关键词搜索 (临时方案)

**说明**:
- 暂时不实现向量搜索
- 专注于优化PostgreSQL全文搜索
- 后续再考虑向量搜索

**优势**:
- ✅ 无需更改基础设施
- ✅ 快速实施
- ✅ 成本低

**劣势**:
- ❌ 缺少语义搜索能力
- ❌ 搜索结果相关性较低

**预计时间**: 0小时 (已实现)

---

## 推荐行动计划

### 短期 (本周)
1. **继续使用当前的全文搜索**
   - PostgreSQL tsvector已经实现
   - 可以提供基本的搜索功能

2. **配置OpenAI Embeddings服务**
   - 实现EmbeddingService
   - 将embeddings存储为JSON数组
   - 为将来迁移做准备

### 中期 (下周)
3. **评估并选择向量数据库方案**
   - 如果预算允许: 迁移到Supabase
   - 如果需要高性能: 使用Pinecone/Qdrant
   - 如果预算有限: 继续使用全文搜索

4. **实现混合搜索架构**
   - 关键词搜索: PostgreSQL tsvector
   - 向量搜索: 外部向量数据库或暂缺
   - 结果融合和排序

---

## 技术实现建议

### 当前阶段: 准备Embeddings但不使用向量搜索

```typescript
// 1. 在Skill模型中添加embedding字段 (存储为JSON)
model Skill {
  // ... 其他字段
  embedding Json?  // 存储为JSON数组而非vector类型
}

// 2. 生成并保存embeddings
const embedding = await embeddingService.generateEmbedding(skillText);
await prisma.skill.update({
  where: { id: skillId },
  data: { embedding }  // 存储为JSON
});

// 3. 暂时只使用关键词搜索
// 未来迁移到支持pgvector的数据库后，可以启用向量搜索
```

### 未来迁移: 切换到Supabase

```bash
# 1. 导出Neon数据
pg_dump $NEON_DATABASE_URL > backup.sql

# 2. 导入到Supabase
psql $SUPABASE_DATABASE_URL < backup.sql

# 3. 启用pgvector
psql $SUPABASE_DATABASE_URL -c "CREATE EXTENSION vector;"

# 4. 更新Schema
ALTER TABLE skills ALTER COLUMN embedding TYPE vector(1536) USING embedding::vector;

# 5. 创建向量索引
CREATE INDEX ON skills USING ivfflat (embedding vector_cosine_ops);
```

---

## 决策建议

基于当前项目状态，我建议：

1. **立即执行**: 
   - ✅ 继续任务8的其他部分 (EmbeddingService实现)
   - ✅ 将embeddings存储为JSON格式
   - ✅ 实现关键词搜索优化

2. **暂缓执行**:
   - ⏸️ 向量搜索功能 (等待数据库迁移)
   - ⏸️ pgvector相关代码

3. **下一步行动**:
   - 📋 评估是否值得迁移到Supabase
   - 📋 如果迁移，安排专门的数据迁移任务
   - 📋 如果不迁移，考虑使用外部向量数据库

---

**更新日期**: 2026-04-19  
**状态**: 待决策  
**影响**: 任务8的部分功能需要调整实施方式

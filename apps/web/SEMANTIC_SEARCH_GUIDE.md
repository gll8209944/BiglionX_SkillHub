# 语义搜索功能使用指南

## 概述

语义搜索功能基于向量相似度实现，能够理解查询的语义含义，而不仅仅是关键词匹配。这使得搜索结果更加准确和相关。

## 功能特性

### 1. 向量相似度搜索
- 使用OpenAI/智谱AI/DeepSeek的Embeddings API生成文本向量
- 通过余弦相似度计算查询与Skills的相关性
- 支持自定义相似度阈值

### 2. 智能技能推荐
- 在Skill详情页显示相关Skills推荐
- 基于语义相似度排序
- 显示相似度百分比

### 3. 语义搜索切换
- 在搜索框中提供语义搜索开关
- 可以随时在传统搜索和语义搜索之间切换
- 保持用户搜索历史

## 使用方法

### 前端使用

1. **启用语义搜索**
   - 访问 http://localhost:3000/skills
   - 在搜索框右侧找到"语义搜索"开关
   - 点击开关启用语义搜索

2. **执行搜索**
   - 输入搜索词（例如："AI chatbot for customer service"）
   - 点击搜索按钮或按Enter键
   - 查看基于语义相似度的搜索结果

3. **查看相关Skills**
   - 访问任意Skill详情页面
   - 在右侧边栏查看"相关 Skills"部分
   - 点击相关Skill查看详情

### API使用

#### 1. 语义搜索API

```bash
GET /api/search/semantic?q=查询词&limit=20&minSimilarity=0.3
```

参数说明：
- `q`: 搜索查询词（必填）
- `limit`: 返回结果数量（可选，默认20）
- `minSimilarity`: 最小相似度阈值（可选，默认0.3）
- `category`: 分类过滤（可选）
- `language`: 语言过滤（可选）
- `source`: 数据源过滤（可选）

响应示例：
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "skill-id",
        "name": "Skill名称",
        "slug": "skill-slug",
        "description": "描述",
        "similarity": 0.85,
        ...
      }
    ],
    "query": "查询词",
    "total": 10,
    "limit": 20,
    "minSimilarity": 0.3
  }
}
```

#### 2. 获取相关Skills API

```bash
GET /api/skills/{skillId}/related?limit=5&minSimilarity=0.5
```

参数说明：
- `skillId`: Skill ID（路径参数）
- `limit`: 返回数量（可选，默认5）
- `minSimilarity`: 最小相似度（可选，默认0.5）

#### 3. 批量生成Embeddings API（管理员专用）

```bash
POST /api/admin/generate-embeddings
Content-Type: application/json
Authorization: Bearer {token}

{
  "skillIds": ["id1", "id2"],  // 可选，不指定则为所有Skills生成
  "batchSize": 10  // 可选，默认10
}
```

### 命令行工具

#### 测试语义搜索功能

```bash
npm run test-semantic-search
```

这将执行以下测试：
1. 检查数据库中是否有带embeddings的Skills
2. 执行示例语义搜索
3. 测试相关Skills推荐功能

#### 批量生成Embeddings

```bash
npm run generate-embeddings
```

这将为所有没有embedding的已批准Skills生成embeddings。

## 技术实现

### 核心组件

1. **EmbeddingService** (`lib/services/EmbeddingService.ts`)
   - 生成文本embeddings
   - 支持多个AI提供商（OpenAI、智谱AI、DeepSeek）
   - 计算余弦相似度

2. **SemanticSearchService** (`lib/search/SemanticSearchService.ts`)
   - 执行语义搜索
   - 获取相关Skills
   - 批量生成embeddings

3. **EnhancedSearchBox** (`components/ui/EnhancedSearchBox.tsx`)
   - 支持语义搜索切换的前端组件
   - 集成搜索建议和历史记录

### 数据存储

- Embeddings存储在PostgreSQL的JSON字段中
- 由于Neon数据库不支持pgvector，目前在应用层计算相似度
- 未来可以迁移到支持向量搜索的数据库以提升性能

## 配置

### 环境变量

确保在 `.env.local` 中配置了以下变量：

```bash
# OpenAI API配置（或智谱AI/DeepSeek）
OPENAI_API_KEY=your-api-key
OPENAI_BASE_URL=https://api.openai.com/v1  # 或其他提供商的URL
```

支持的提供商：
- OpenAI: `https://api.openai.com/v1`
- 智谱AI: `https://open.bigmodel.cn/api/paas/v4`
- DeepSeek: `https://api.deepseek.com`

### 相似度阈值调整

可以根据实际需求调整相似度阈值：

- **搜索阈值**: 默认0.3，降低可获取更多结果但可能不够精准
- **相关Skills阈值**: 默认0.5，提高可确保更高的相关性

## 性能优化建议

1. **批量生成Embeddings**
   - 在低峰期运行批量生成脚本
   - 使用适当的batch size避免API速率限制

2. **缓存策略**
   - 可以考虑缓存热门搜索的embeddings
   - 缓存相关Skills推荐结果

3. **数据库优化**
   - 为embedding字段添加索引
   - 考虑迁移到支持向量搜索的数据库（如Supabase、Pinecone等）

## 故障排除

### 问题1: 搜索结果为空

可能原因：
- 数据库中没有带embeddings的Skills
- 相似度阈值设置过高
- API密钥配置错误

解决方法：
```bash
# 1. 检查embeddings状态
npm run test-semantic-search

# 2. 生成embeddings
npm run generate-embeddings

# 3. 检查环境变量
cat .env.local | grep OPENAI
```

### 问题2: API调用失败

可能原因：
- API密钥无效或过期
- 网络连接问题
- API速率限制

解决方法：
- 验证API密钥有效性
- 检查网络连接
- 降低batch size或增加延迟

### 问题3: 搜索速度慢

可能原因：
- Skills数量过多
- 在应用层计算相似度效率低

解决方法：
- 迁移到支持向量搜索的数据库
- 实现embeddings缓存
- 减少每次搜索的Skills数量

## 未来改进方向

1. **向量数据库集成**
   - 集成Pinecone、Weaviate或Supabase Vector
   - 实现高效的向量相似度搜索

2. **混合搜索**
   - 结合传统关键词搜索和语义搜索
   - 提供更灵活的搜索选项

3. **搜索学习**
   - 记录用户点击行为
   - 优化相似度算法

4. **多语言支持**
   - 支持中文等多语言的语义搜索
   - 使用多语言embedding模型

## 相关链接

- [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings)
- [智谱AI API文档](https://open.bigmodel.cn/dev/api)
- [DeepSeek API文档](https://platform.deepseek.com/)
- [余弦相似度](https://en.wikipedia.org/wiki/Cosine_similarity)

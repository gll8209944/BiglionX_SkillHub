# SkillHub Search SDK

> 为您的应用集成强大的AI技能搜索功能

## 特性

- 🔍 **全文搜索** - 支持关键词、分类、标签等多维度搜索
- 🧠 **语义搜索** - 基于向量相似度的智能语义搜索
- ⚡ **高性能** - 内置缓存和批量优化
- 🎯 **类型安全** - 完整的TypeScript类型定义
- 📦 **轻量级** - 零依赖（除axios外）

## 安装

```bash
npm install @skillhub/search-sdk
# 或
yarn add @skillhub/search-sdk
# 或
pnpm add @skillhub/search-sdk
```

## 快速开始

### 基础搜索

```typescript
import { SearchSDK } from '@skillhub/search-sdk';

// 初始化SDK
const sdk = new SearchSDK({
  apiUrl: 'https://your-skillhub-instance.com/api',
  // apiKey: 'your-api-key' // 如果需要认证
});

// 执行搜索
async function searchSkills() {
  const results = await sdk.search({
    query: 'python automation',
    category: 'development',
    page: 1,
    pageSize: 20,
    sortBy: 'relevance'
  });

  console.log(`找到 ${results.total} 个结果`);
  results.skills.forEach(skill => {
    console.log(`${skill.name}: ${skill.description}`);
  });
}

searchSkills();
```

### 语义搜索

```typescript
import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: 'https://your-skillhub-instance.com/api'
});

// 执行语义搜索（理解查询意图，而不仅仅是关键词匹配）
async function semanticSearch() {
  const results = await sdk.semanticSearch({
    query: '如何自动化处理Excel文件',
    limit: 10,
    minSimilarity: 0.5
  });

  console.log('语义搜索结果：');
  results.forEach(result => {
    console.log(`${result.name} (相似度: ${result.similarity.toFixed(2)})`);
  });
}

semanticSearch();
```

### 获取相关技能

```typescript
// 获取与指定技能相关的其他技能
async function getRelatedSkills(skillId: string) {
  const related = await sdk.getRelatedSkills(skillId, {
    limit: 5,
    minSimilarity: 0.6
  });

  console.log('相关技能：');
  related.forEach(skill => {
    console.log(`- ${skill.name}`);
  });
}
```

### 高级搜索

```typescript
// 多条件组合搜索
async function advancedSearch() {
  const results = await sdk.advancedSearch({
    query: 'data processing',
    categories: ['development', 'data-science'],
    languages: ['python', 'javascript'],
    sources: ['github', 'gitlab'],
    minStars: 100,
    minQualityScore: 7.0,
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date()
    },
    page: 1,
    pageSize: 20
  });

  console.log(`高级搜索找到 ${results.total} 个结果`);
}
```

### 搜索建议

```typescript
// 获取搜索建议（自动补全）
async function getSuggestions() {
  const suggestions = await sdk.getSuggestions('pyt');
  
  console.log('搜索建议：');
  suggestions.forEach(suggestion => {
    console.log(`- ${suggestion.text} (${suggestion.type})`);
  });
}
```

### 热门搜索词

```typescript
// 获取热门搜索词
async function getPopularSearches() {
  const popular = await sdk.getPopularSearches(10);
  
  console.log('热门搜索：');
  popular.forEach((term, index) => {
    console.log(`${index + 1}. ${term}`);
  });
}
```

## API 参考

### SearchSDK 配置

```typescript
interface SearchSDKConfig {
  /** API基础URL */
  apiUrl: string;
  /** API密钥（可选） */
  apiKey?: string;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
}
```

### 搜索选项

```typescript
interface SearchOptions {
  /** 搜索关键词 */
  query?: string;
  /** 分类过滤 */
  category?: string;
  /** 子分类过滤 */
  subcategory?: string;
  /** 语言过滤 */
  language?: string;
  /** 最小质量评分 */
  minQualityScore?: number;
  /** 数据源过滤 */
  source?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
  /** 排序方式 */
  sortBy?: 'relevance' | 'quality' | 'updated' | 'stars' | 'downloads';
}
```

### 语义搜索选项

```typescript
interface SemanticSearchOptions {
  /** 搜索查询 */
  query: string;
  /** 返回结果数量 */
  limit?: number;
  /** 最小相似度阈值 (0-1) */
  minSimilarity?: number;
  /** 分类过滤 */
  category?: string;
  /** 语言过滤 */
  language?: string;
  /** 数据源过滤 */
  source?: string;
}
```

### 高级搜索选项

```typescript
interface AdvancedSearchOptions {
  /** 搜索关键词 */
  query?: string;
  /** 多个分类 */
  categories?: string[];
  /** 多个语言 */
  languages?: string[];
  /** 多个数据源 */
  sources?: string[];
  /** 最小Stars数 */
  minStars?: number;
  /** 最小质量评分 */
  minQualityScore?: number;
  /** 日期范围 */
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  /** 页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
}
```

## 使用场景

### 1. 在Web应用中集成

```typescript
// React组件示例
import { useState } from 'react';
import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: process.env.NEXT_PUBLIC_SKILLHUB_API_URL
});

function SkillSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await sdk.search({ query, page: 1, pageSize: 20 });
    setResults(data.skills);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch}>搜索</button>
      
      <ul>
        {results.map(skill => (
          <li key={skill.id}>
            <h3>{skill.name}</h3>
            <p>{skill.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 2. 在CLI工具中使用

```typescript
#!/usr/bin/env node
import { SearchSDK } from '@skillhub/search-sdk';
import chalk from 'chalk';

const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com'
});

async function main() {
  const query = process.argv[2];
  
  if (!query) {
    console.error('请提供搜索关键词');
    process.exit(1);
  }

  console.log(chalk.blue(`🔍 搜索: ${query}\n`));
  
  const results = await sdk.search({ query, pageSize: 10 });
  
  if (results.total === 0) {
    console.log(chalk.yellow('未找到相关技能'));
    return;
  }

  results.skills.forEach((skill, index) => {
    console.log(chalk.cyan(`${index + 1}. ${skill.name}`));
    console.log(chalk.gray(`   ${skill.description}`));
    console.log(chalk.gray(`   ⭐ ${skill.starCount} | 📥 ${skill.downloadCount}`));
    console.log('');
  });
}

main();
```

### 3. 在Node.js后端服务中

```typescript
import express from 'express';
import { SearchSDK } from '@skillhub/search-sdk';

const app = express();
const sdk = new SearchSDK({
  apiUrl: process.env.SKILLHUB_API_URL
});

// 代理搜索API
app.get('/api/skills/search', async (req, res) => {
  try {
    const results = await sdk.search({
      query: req.query.q as string,
      category: req.query.category as string,
      page: parseInt(req.query.page as string) || 1,
      pageSize: parseInt(req.query.pageSize as string) || 20
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: '搜索失败' });
  }
});

app.listen(3000);
```

## 部署自己的SkillHub实例

如果您想部署自己的SkillHub实例，请参考：
- [SkillHub GitHub仓库](https://github.com/skillhub/skillhub)
- [部署文档](https://github.com/skillhub/skillhub/blob/main/docs/DEPLOYMENT.md)

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 支持

- 📧 Email: support@skillhub.com
- 💬 Discord: [加入社区](https://discord.gg/skillhub)
- 🐛 Issues: [GitHub Issues](https://github.com/skillhub/skillhub/issues)

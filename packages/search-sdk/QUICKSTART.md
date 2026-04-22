# SkillHub Search SDK - 快速开始指南

## 5分钟快速集成

### 步骤1: 安装SDK

```bash
npm install @skillhub/search-sdk
```

### 步骤2: 初始化SDK

```typescript
import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: 'https://your-skillhub-instance.com/api'
});
```

### 步骤3: 执行搜索

```typescript
// 基础搜索
const results = await sdk.search({
  query: 'python automation',
  page: 1,
  pageSize: 20
});

console.log(`找到 ${results.total} 个结果`);
results.skills.forEach(skill => {
  console.log(`${skill.name}: ${skill.description}`);
});
```

### 步骤4: 尝试语义搜索

```typescript
// 语义搜索 - 理解查询意图
const semanticResults = await sdk.semanticSearch({
  query: '如何自动化处理Excel文件',
  limit: 10
});

semanticResults.forEach(result => {
  console.log(`${result.name} (相似度: ${(result.similarity * 100).toFixed(1)}%)`);
});
```

## 完整示例项目

我们提供了多个示例供您参考：

```bash
# 克隆仓库
git clone https://github.com/skillhub/skillhub.git
cd skillhub/packages/search-sdk

# 安装依赖
npm install

# 运行示例
npx ts-node examples/basic-search.ts
npx ts-node examples/semantic-search.ts
npx ts-node examples/advanced-search.ts
npx ts-node examples/comprehensive.ts
```

## 常见使用场景

### 1. 在React应用中使用

```tsx
import { useState } from 'react';
import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: process.env.NEXT_PUBLIC_SKILLHUB_API_URL
});

function SkillSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await sdk.search({ query });
    setResults(data.skills);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="搜索技能..."
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

### 2. 在Vue应用中使用

```vue
<template>
  <div>
    <input v-model="query" @keyup.enter="search" placeholder="搜索技能..." />
    <button @click="search">搜索</button>
    
    <div v-for="skill in results" :key="skill.id">
      <h3>{{ skill.name }}</h3>
      <p>{{ skill.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: import.meta.env.VITE_SKILLHUB_API_URL
});

const query = ref('');
const results = ref([]);

async function search() {
  const data = await sdk.search({ query: query.value });
  results.value = data.skills;
}
</script>
```

### 3. 在Node.js CLI工具中使用

```javascript
#!/usr/bin/env node
const { SearchSDK } = require('@skillhub/search-sdk');
const chalk = require('chalk');

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

### 4. 在Express后端中作为代理

```javascript
const express = require('express');
const { SearchSDK } = require('@skillhub/search-sdk');

const app = express();
const sdk = new SearchSDK({
  apiUrl: process.env.SKILLHUB_API_URL
});

// 代理搜索API
app.get('/api/skills/search', async (req, res) => {
  try {
    const results = await sdk.search({
      query: req.query.q,
      category: req.query.category,
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 20
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: '搜索失败' });
  }
});

app.listen(3000);
```

## API端点配置

确保您的SkillHub实例正在运行，并且API端点可访问。默认情况下：

- 本地开发: `http://localhost:3000/api`
- 生产环境: `https://your-domain.com/api`

### 需要的API端点

SDK需要以下API端点：

- `GET /search` - 全文搜索
- `POST /search` - 高级搜索
- `GET /search/semantic` - 语义搜索
- `GET /search/suggestions` - 搜索建议
- `GET /search/popular` - 热门搜索
- `GET /skills/:id/related` - 相关技能
- `GET /health` - 健康检查

如果您使用的是完整的SkillHub实例，这些端点已经包含在内。

## 部署自己的SkillHub实例

想要完全控制？部署您自己的SkillHub实例：

```bash
# 克隆SkillHub仓库
git clone https://github.com/skillhub/skillhub.git
cd skillhub

# 使用Docker Compose启动
docker-compose up -d

# 访问 http://localhost:3000
```

详细部署指南请参考: [DEPLOYMENT.md](../../docs/DEPLOYMENT.md)

## 下一步

- 📖 查看完整文档: [README.md](./README.md)
- 💡 查看更多示例: [examples/](./examples/)
- 🐛 报告问题: [GitHub Issues](https://github.com/skillhub/skillhub/issues)
- 💬 加入社区: [Discord](https://discord.gg/skillhub)

## 许可证

MIT License - 自由使用、修改和分发

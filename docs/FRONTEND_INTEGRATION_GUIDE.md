# SkillHub搜索引擎SDK - 前端集成完整指南

## 📚 目录

1. [React/Next.js集成](#reactnextjs集成)
2. [Vue 3集成](#vue-3集成)
3. [Angular集成](#angular集成)
4. [原生JavaScript集成](#原生javascript集成)
5. [最佳实践](#最佳实践)
6. [常见问题](#常见问题)

---

## React/Next.js集成

### 步骤1: 安装依赖

```bash
npm install @skillhub/search-sdk
```

### 步骤2: 创建搜索服务

文件: `lib/search-service.ts`

```typescript
import { SearchSDK, SearchOptions } from '@skillhub/search-sdk';

// 创建单例
const sdk = new SearchSDK({
  apiUrl: process.env.NEXT_PUBLIC_SKILLHUB_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
});

export async function searchSkills(options: SearchOptions) {
  return await sdk.search(options);
}

export async function semanticSearch(query: string) {
  return await sdk.semanticSearch({ query, limit: 10 });
}

export default sdk;
```

### 步骤3: 创建搜索组件

文件: `components/SkillSearchBox.tsx`

```tsx
'use client';

import { useState } from 'react';
import { searchSkills } from '@/lib/search-service';

export default function SkillSearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await searchSkills({ 
      query, 
      page: 1, 
      pageSize: 20 
    });
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
      
      {results.map(skill => (
        <div key={skill.id}>
          <h3>{skill.name}</h3>
          <p>{skill.description}</p>
        </div>
      ))}
    </div>
  );
}
```

### 步骤4: 在页面中使用

文件: `app/search/page.tsx`

```tsx
import SkillSearchBox from '@/components/SkillSearchBox';

export default function SearchPage() {
  return (
    <div>
      <h1>技能搜索</h1>
      <SkillSearchBox />
    </div>
  );
}
```

---

## Vue 3集成

### 步骤1: 安装依赖

```bash
npm install @skillhub/search-sdk
```

### 步骤2: 创建Composable

文件: `composables/useSkillSearch.ts`

```typescript
import { ref } from 'vue';
import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: import.meta.env.VITE_SKILLHUB_API_URL
});

export function useSkillSearch() {
  const results = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function search(query: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await sdk.search({ 
        query,
        page: 1,
        pageSize: 20
      });
      results.value = data.skills;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  return {
    results,
    loading,
    error,
    search
  };
}
```

### 步骤3: 在组件中使用

文件: `components/SkillSearch.vue`

```vue
<template>
  <div>
    <input
      v-model="query"
      @keyup.enter="handleSearch"
      placeholder="搜索技能..."
    />
    <button @click="handleSearch" :disabled="loading">
      {{ loading ? '搜索中...' : '搜索' }}
    </button>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-for="skill in results" :key="skill.id" class="skill-card">
      <h3>{{ skill.name }}</h3>
      <p>{{ skill.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSkillSearch } from '@/composables/useSkillSearch';

const query = ref('');
const { results, loading, error, search } = useSkillSearch();

async function handleSearch() {
  await search(query.value);
}
</script>
```

---

## Angular集成

### 步骤1: 安装依赖

```bash
npm install @skillhub/search-sdk
```

### 步骤2: 创建Service

文件: `services/skill-search.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { SearchSDK } from '@skillhub/search-sdk';

@Injectable({
  providedIn: 'root'
})
export class SkillSearchService {
  private sdk: SearchSDK;

  constructor() {
    this.sdk = new SearchSDK({
      apiUrl: environment.skillhubApiUrl
    });
  }

  async search(query: string, page = 1, pageSize = 20) {
    return await this.sdk.search({
      query,
      page,
      pageSize
    });
  }

  async semanticSearch(query: string) {
    return await this.sdk.semanticSearch({ query });
  }
}
```

### 步骤3: 在Component中使用

文件: `components/search/search.component.ts`

```typescript
import { Component } from '@angular/core';
import { SkillSearchService } from '../../services/skill-search.service';

@Component({
  selector: 'app-search',
  template: `
    <div>
      <input [(ngModel)]="query" (keyup.enter)="search()" />
      <button (click)="search()">搜索</button>
      
      <div *ngFor="let skill of results">
        <h3>{{ skill.name }}</h3>
        <p>{{ skill.description }}</p>
      </div>
    </div>
  `
})
export class SearchComponent {
  query = '';
  results: any[] = [];

  constructor(private searchService: SkillSearchService) {}

  async search() {
    const data = await this.searchService.search(this.query);
    this.results = data.skills;
  }
}
```

---

## 原生JavaScript集成

### 基本用法

```html
<!DOCTYPE html>
<html>
<head>
  <title>Skill Search</title>
</head>
<body>
  <input type="text" id="searchInput" placeholder="搜索技能..." />
  <button id="searchBtn">搜索</button>
  <div id="results"></div>

  <script type="module">
    import { SearchSDK } from '@skillhub/search-sdk';

    const sdk = new SearchSDK({
      apiUrl: 'http://localhost:3000/api'
    });

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultsDiv = document.getElementById('results');

    searchBtn.addEventListener('click', async () => {
      const query = searchInput.value;
      
      try {
        const data = await sdk.search({ 
          query,
          page: 1,
          pageSize: 20
        });

        resultsDiv.innerHTML = data.skills.map(skill => `
          <div class="skill-card">
            <h3>${skill.name}</h3>
            <p>${skill.description}</p>
          </div>
        `).join('');
      } catch (error) {
        resultsDiv.innerHTML = `<p class="error">搜索失败: ${error.message}</p>`;
      }
    });
  </script>
</body>
</html>
```

---

## 最佳实践

### 1. 使用环境变量

```typescript
// .env.local
NEXT_PUBLIC_SKILLHUB_API_URL=https://api.skillhub.com

// 代码中使用
const sdk = new SearchSDK({
  apiUrl: process.env.NEXT_PUBLIC_SKILLHUB_API_URL
});
```

### 2. 实现缓存机制

```typescript
const cache = new Map();

async function cachedSearch(query: string) {
  if (cache.has(query)) {
    return cache.get(query);
  }
  
  const results = await sdk.search({ query });
  cache.set(query, results);
  
  // 5分钟后清除缓存
  setTimeout(() => cache.delete(query), 5 * 60 * 1000);
  
  return results;
}
```

### 3. 错误处理

```typescript
try {
  const results = await sdk.search({ query });
} catch (error) {
  if (error.message.includes('timeout')) {
    // 处理超时
    showTimeoutMessage();
  } else if (error.message.includes('401')) {
    // 处理认证错误
    redirectToLogin();
  } else {
    // 其他错误
    showErrorMessage(error.message);
  }
}
```

### 4. 防抖搜索

```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query) => {
  const results = await sdk.search({ query });
  updateResults(results);
}, 300);

// 使用
input.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

### 5. 分页加载

```typescript
const [page, setPage] = useState(1);
const [allSkills, setAllSkills] = useState([]);

async function loadMore() {
  const data = await sdk.search({ 
    query,
    page: page + 1,
    pageSize: 20
  });
  
  setAllSkills(prev => [...prev, ...data.skills]);
  setPage(prev => prev + 1);
}
```

---

## 常见问题

### Q1: CORS错误

**问题**: 浏览器报CORS错误

**解决方案**:
```typescript
// 方案1: 在后端配置CORS
// 方案2: 使用代理
// Next.js: next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/skillhub/:path*',
        destination: 'https://api.skillhub.com/:path*'
      }
    ];
  }
};
```

### Q2: TypeScript类型错误

**问题**: 找不到类型定义

**解决方案**:
```bash
# 确保安装了最新版本
npm install @skillhub/search-sdk@latest

# 重启TypeScript服务器
# VSCode: Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### Q3: 搜索结果为空

**问题**: 搜索返回空结果

**解决方案**:
```typescript
// 检查API连接
const isHealthy = await sdk.healthCheck();
if (!isHealthy) {
  console.error('API不可用');
}

// 尝试更宽松的搜索条件
const results = await sdk.search({
  query: 'python',  // 使用更通用的关键词
  page: 1,
  pageSize: 50
});
```

### Q4: 性能优化

**问题**: 搜索响应慢

**解决方案**:
```typescript
// 1. 减少pageSize
const results = await sdk.search({
  query,
  pageSize: 10  // 而不是50
});

// 2. 使用缓存
// 3. 实现虚拟滚动
// 4. 懒加载图片
```

---

## 完整示例项目

我们提供了完整的示例项目供参考：

```bash
# 克隆仓库
git clone https://github.com/skillhub/skillhub.git

# 查看React示例
cd skillhub/apps/web/app/search-demo

# 查看SDK示例
cd skillhub/packages/search-sdk/examples
```

---

## 下一步

- 📖 阅读[SDK完整文档](../../packages/search-sdk/README.md)
- 💡 查看[更多示例](../../packages/search-sdk/examples/)
- 🐛 报告问题: [GitHub Issues](https://github.com/skillhub/skillhub/issues)
- 💬 加入社区: [Discord](https://discord.gg/skillhub)

祝您集成顺利！🎉

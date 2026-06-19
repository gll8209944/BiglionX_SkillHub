# SkillHub搜索引擎插件集成指南

本文档详细介绍如何将SkillHub搜索引擎作为插件集成到您的项目中。

## 📋 目录

1. [快速集成（推荐）](#快速集成推荐)
2. [Docker容器化部署](#docker容器化部署)
3. [微服务架构集成](#微服务架构集成)
4. [前端项目集成](#前端项目集成)
5. [后端项目集成](#后端项目集成)
6. [配置选项](#配置选项)
7. [故障排除](#故障排除)

---

## 快速集成（推荐）

### 步骤1: 安装SDK

```bash
npm install @skillhub/search-sdk
```

### 步骤2: 初始化并搜索

```typescript
import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com' // 或使用您的实例URL
});

// 执行搜索
const results = await sdk.search({
  query: 'python automation',
  page: 1,
  pageSize: 20
});

console.log(results);
```

**就这么简单！** ✨

---

## Docker容器化部署

如果您希望将搜索引擎作为独立服务运行：

### 方式1: 使用预构建镜像

```bash
# 拉取镜像
docker pull skillhub/search-plugin:latest

# 运行容器
docker run -d \
  --name skillhub-search \
  -p 3001:3001 \
  -e SKILLHUB_API_URL=https://api.skillhub.com \
  skillhub/search-plugin:latest
```

### 方式2: 从源码构建

```bash
# 克隆仓库
git clone https://github.com/skillhub/skillhub.git
cd skillhub/packages/search-sdk

# 构建镜像
docker build -f Dockerfile.plugin -t skillhub-search-plugin .

# 运行
docker run -d \
  --name skillhub-search \
  -p 3001:3001 \
  -e SKILLHUB_API_URL=http://your-backend:3000/api \
  skillhub-search-plugin
```

### 方式3: 使用Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  search-plugin:
    image: skillhub/search-plugin:latest
    ports:
      - "3001:3001"
    environment:
      - SKILLHUB_API_URL=http://skillhub-backend:3000/api
    restart: unless-stopped
```

启动服务：

```bash
docker-compose up -d
```

---

## 微服务架构集成

在微服务架构中，搜索引擎可以作为独立服务：

### 架构图

```
┌─────────────┐
│  API Gateway │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│   Web App   │ │ Mobile   │ │  Other     │
│             │ │  App     │ │  Services  │
└─────────────┘ └──────────┘ └────────────┘
                       │
                ┌──────▼────────┐
                │ Search Plugin │
                │  (Port 3001)  │
                └──────┬────────┘
                       │
                ┌──────▼────────┐
                │ SkillHub Core │
                │  (Port 3000)  │
                └───────────────┘
```

### Kubernetes部署示例

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: skillhub-search-plugin
spec:
  replicas: 3
  selector:
    matchLabels:
      app: skillhub-search
  template:
    metadata:
      labels:
        app: skillhub-search
    spec:
      containers:
      - name: search-plugin
        image: skillhub/search-plugin:latest
        ports:
        - containerPort: 3001
        env:
        - name: SKILLHUB_API_URL
          value: "http://skillhub-backend:3000/api"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: skillhub-search-service
spec:
  selector:
    app: skillhub-search
  ports:
  - port: 80
    targetPort: 3001
  type: ClusterIP
```

---

## 前端项目集成

### React / Next.js

```tsx
// lib/search.ts
import { SearchSDK } from '@skillhub/search-sdk';

export const searchSDK = new SearchSDK({
  apiUrl: process.env.NEXT_PUBLIC_SKILLHUB_API_URL || 'http://localhost:3000/api'
});

// components/SkillSearch.tsx
import { useState } from 'react';
import { searchSDK } from '@/lib/search';

export default function SkillSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchSDK.search({ 
        query,
        page: 1,
        pageSize: 20
      });
      setResults(data.skills);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="搜索技能..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? '搜索中...' : '搜索'}
      </button>
      
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

### Vue 3

```vue
<!-- components/SkillSearch.vue -->
<template>
  <div>
    <input
      v-model="query"
      @keyup.enter="search"
      placeholder="搜索技能..."
    />
    <button @click="search" :disabled="loading">
      {{ loading ? '搜索中...' : '搜索' }}
    </button>
    
    <div v-for="skill in results" :key="skill.id" class="skill-card">
      <h3>{{ skill.name }}</h3>
      <p>{{ skill.description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: import.meta.env.VITE_SKILLHUB_API_URL
});

const query = ref('');
const results = ref([]);
const loading = ref(false);

async function search() {
  loading.value = true;
  try {
    const data = await sdk.search({ query: query.value });
    results.value = data.skills;
  } catch (error) {
    console.error('Search failed:', error);
  } finally {
    loading.value = false;
  }
}
</script>
```

---

## 后端项目集成

### Node.js / Express

```javascript
const express = require('express');
const { SearchSDK } = require('@skillhub/search-sdk');

const app = express();
const sdk = new SearchSDK({
  apiUrl: process.env.SKILLHUB_API_URL
});

// 搜索端点
app.get('/api/search', async (req, res) => {
  try {
    const results = await sdk.search({
      query: req.query.q,
      category: req.query.category,
      page: parseInt(req.query.page) || 1,
      pageSize: parseInt(req.query.pageSize) || 20
    });
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ 
      error: '搜索失败',
      message: error.message 
    });
  }
});

// 语义搜索端点
app.get('/api/semantic-search', async (req, res) => {
  try {
    const results = await sdk.semanticSearch({
      query: req.query.q,
      limit: parseInt(req.query.limit) || 10
    });
    
    res.json({ results });
  } catch (error) {
    res.status(500).json({ 
      error: '语义搜索失败',
      message: error.message 
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Python / FastAPI

```python
from fastapi import FastAPI, Query
from typing import Optional
import httpx

app = FastAPI()

SKILLHUB_API_URL = "http://localhost:3000/api"

@app.get("/api/search")
async def search_skills(
    q: str = Query(..., description="搜索关键词"),
    category: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    async with httpx.AsyncClient() as client:
        params = {
            "q": q,
            "page": page,
            "pageSize": page_size
        }
        if category:
            params["category"] = category
            
        response = await client.get(
            f"{SKILLHUB_API_URL}/search",
            params=params
        )
        return response.json()

@app.get("/api/semantic-search")
async def semantic_search(
    q: str = Query(..., description="搜索查询"),
    limit: int = Query(10, ge=1, le=50)
):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{SKILLHUB_API_URL}/search/semantic",
            params={"query": q, "limit": limit}
        )
        return response.json()
```

---

## 配置选项

### SDK配置

```typescript
interface SearchSDKConfig {
  /** API基础URL（必需） */
  apiUrl: string;
  
  /** API密钥（可选，用于认证） */
  apiKey?: string;
  
  /** 请求超时时间（毫秒），默认 30000 */
  timeout?: number;
  
  /** 自定义请求头 */
  headers?: Record<string, string>;
}
```

### 环境变量

```bash
# .env文件
SKILLHUB_API_URL=https://api.skillhub.com
SKILLHUB_API_KEY=your-api-key-optional
SEARCH_TIMEOUT=30000
```

---

## 故障排除

### 常见问题

#### 1. 连接超时

**问题**: `Error: timeout of 30000ms exceeded`

**解决方案**:
```typescript
const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com',
  timeout: 60000 // 增加超时时间
});
```

#### 2. CORS错误（浏览器环境）

**问题**: `Access to fetch has been blocked by CORS policy`

**解决方案**: 确保后端API允许CORS，或在服务器端代理请求。

#### 3. 认证失败

**问题**: `401 Unauthorized`

**解决方案**:
```typescript
const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com',
  apiKey: 'your-valid-api-key'
});
```

#### 4. 找不到模块

**问题**: `Cannot find module '@skillhub/search-sdk'`

**解决方案**:
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install @skillhub/search-sdk
```

### 调试模式

启用详细日志：

```typescript
const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com',
  headers: {
    'X-Debug-Mode': 'true'
  }
});
```

### 获取帮助

- 📖 查看文档: [README.md](./README.md)
- 🐛 报告问题: [GitHub Issues](https://github.com/skillhub/skillhub/issues)
- 💬 社区支持: [Discord](https://discord.gg/skillhub)

---

## 最佳实践

1. **复用SDK实例**: 创建单例而非每次新建
2. **错误处理**: 始终包裹try-catch
3. **缓存结果**: 对频繁搜索的查询进行缓存
4. **分页加载**: 使用分页避免一次性加载大量数据
5. **超时设置**: 根据网络情况调整超时时间
6. **监控性能**: 记录搜索耗时和成功率

---

## 下一步

- 📚 阅读完整API文档
- 💡 查看更多示例代码
- 🚀 部署您的SkillHub实例
- 🤝 参与社区贡献

祝您集成顺利！🎉

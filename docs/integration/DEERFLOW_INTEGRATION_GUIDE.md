# DeerFlow 2.0 集成指南

> **版本**: v1.0  
> **更新日期**: 2026-04-18  
> **目标**: 将DeerFlow 2.0作为智能体调度框架，构建自动化的技能发现和更新流水线

---

## 📋 目录

- [DeerFlow 2.0简介](#deerflow-20简介)
- [核心特性](#核心特性)
- [为什么选择DeerFlow](#为什么选择deerflow)
- [安装与部署](#安装与部署)
- [配置指南](#配置指南)
- [Agent编排设计](#agent编排设计)
- [自定义Skills开发](#自定义skills开发)
- [流水线集成](#流水线集成)
- [API集成](#api集成)
- [监控与运维](#监控与运维)
- [最佳实践](#最佳实践)
- [故障排查](#故障排查)

---

## DeerFlow 2.0简介

### 什么是DeerFlow?

**DeerFlow** (Deep Exploration and Efficient Research Flow) 是字节跳动开源的超级Agent编排框架。

**项目信息**:
- 🌟 GitHub Stars: 59,000+
- 🏢 出品方: 字节跳动 (ByteDance)
- 📅 2.0发布: 2026年2月28日
- 📜 许可证: MIT
- 🔗 GitHub: https://github.com/bytedance/deer-flow
- 🌐 官网: https://deerflow.tech

### 核心定位

DeerFlow 2.0不是一个"大而全"的AI，而是一个能调动各种AI能力的**"指挥官"** (Harness)。

**设计理念**:
```
┌─────────────────────────────────────────┐
│         DeerFlow 2.0 Architecture        │
├─────────────────────────────────────────┤
│                                         │
│  Your Business Logic                    │
│  (Define Skills, Orchestrate Agents)    │
│              ▲                          │
│              │                          │
│  ┌───────────┴───────────┐             │
│  │   SuperAgent Harness   │             │
│  │  • Sub-Agent Coordination            │
│  │  • Memory Management                 │
│  │  • Sandboxed Execution               │
│  │  • Extensible Skills                 │
│  └───────────┬───────────┘             │
│              │                          │
│  ┌───────────┴───────────┐             │
│  │   Infrastructure       │             │
│  │  • LangGraph           │             │
│  │  • LangChain           │             │
│  │  • Vector DB           │             │
│  │  • Search Tools        │             │
│  └───────────────────────┘             │
│                                         │
└─────────────────────────────────────────┘
```

---

## 核心特性

### 1. 多Agent协作编排

- **Sub-Agent系统**: 创建和协调多个专业Agent
- **工作流引擎**: 基于LangGraph的可视化流程编排
- **动态路由**: 根据任务类型智能分配Agent
- **并行执行**: 支持多Agent并发处理

### 2. Memory持久化

- **长期记忆**: 跨会话保存上下文
- **向量检索**: 基于相似度的记忆召回
- **记忆管理**: 自动清理和优化存储空间
- **个性化**: 为不同用户维护独立记忆

### 3. 沙盒隔离

- **安全执行**: 隔离的代码运行环境
- **资源限制**: CPU、内存、网络控制
- **权限管理**: 细粒度的权限控制
- **审计日志**: 完整的执行记录

### 4. 可扩展Skills

- **插件系统**: 热插拔的Skill扩展
- **工具集成**: 内置搜索、爬虫、代码执行等工具
- **自定义工具**: 轻松添加自己的工具
- **社区生态**: 共享和复用Skills

### 5. 内置搜索引擎

- **Tavily Search**: 专业的AI搜索API
- **InfoQuest**: 深度信息检索
- **GitHub Search**: 代码仓库搜索
- **自定义搜索引擎**: 接入任意搜索API

### 6. 爬虫工具

- **网页抓取**: 支持JavaScript渲染
- **内容提取**: 智能识别主要内容
- **结构化解析**: 自动提取表格、列表等
- **反爬策略**: User-Agent轮换、延迟控制

---

## 为什么选择DeerFlow

### 对比其他方案

| 特性 | DeerFlow 2.0 | LangGraph | CrewAI | AutoGen |
|------|-------------|-----------|--------|---------|
| **易用性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **功能完整性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **社区活跃度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **企业级支持** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| **中文文档** | ✅ | ❌ | ❌ | ❌ |
| **开箱即用** | ✅ | ❌ | ✅ | ❌ |

### 优势总结

1. **字节背书**: 大厂品质，经过内部验证
2. **完全重写**: 2.0版本架构更清晰，性能更优
3. **一站式方案**: 从开发到部署全流程支持
4. **活跃社区**: 59k+ Stars，快速迭代
5. **生产就绪**: 支持Docker、K8s部署
6. **中文友好**: 官方提供中文文档和支持

---

## 安装与部署

### 方式1: Docker部署（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/bytedance/deer-flow.git
cd deer-flow

# 2. 生成配置文件
make config

# 3. 编辑config.yaml（见下一节）

# 4. 设置环境变量
cp .env.example .env
# 编辑.env，填入API Keys

# 5. 初始化Docker（只需一次）
make docker-init

# 6. 启动服务
make docker-start

# 7. 访问 http://localhost:2026
```

### 方式2: 本地开发

```bash
# 1. 环境要求
# - Python 3.12+
# - Node.js 22+
# - uv (Python包管理器)

# 2. 克隆仓库
git clone https://github.com/bytedance/deer-flow.git
cd deer-flow

# 3. 检查依赖
make check

# 4. 安装依赖
make install

# 5. 生成配置
make config

# 6. 启动开发服务器
make dev

# 7. 访问 http://localhost:2026
```

### 方式3: Kubernetes部署

```yaml
# k8s/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: deerflow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: deerflow
  template:
    metadata:
      labels:
        app: deerflow
    spec:
      containers:
      - name: deerflow
        image: bytedance/deerflow:latest
        ports:
        - containerPort: 2026
        envFrom:
        - secretRef:
            name: deerflow-secrets
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
---
apiVersion: v1
kind: Service
metadata:
  name: deerflow-service
spec:
  selector:
    app: deerflow
  ports:
  - port: 80
    targetPort: 2026
  type: LoadBalancer
```

---

## 配置指南

### 基础配置 (config.yaml)

```yaml
# config.yaml

# 模型配置
models:
  # OpenAI GPT-4
  - name: gpt-4
    display_name: GPT-4
    use: langchain_openai:ChatOpenAI
    model: gpt-4
    api_key: $OPENAI_API_KEY
    max_tokens: 4096
    temperature: 0.7
  
  # OpenRouter (支持多种模型)
  - name: openrouter-gemini-2.5-flash
    display_name: Gemini 2.5 Flash
    use: langchain_openai:ChatOpenAI
    model: google/gemini-2.5-flash-preview
    api_key: $OPENAI_API_KEY
    base_url: https://openrouter.ai/api/v1
    max_tokens: 8192
    temperature: 0.5
  
  # 豆包 Seed 2.0 Code (推荐)
  - name: doubao-seed-2-code
    display_name: Doubao Seed 2.0 Code
    use: langchain_openai:ChatOpenAI
    model: doubao-seed-2.0-code
    api_key: $DOUBAO_API_KEY
    base_url: https://ark.cn-beijing.volces.com/api/v3
    max_tokens: 32768
    temperature: 0.3

# 默认模型
default_model: doubao-seed-2-code

# Agent配置
agents:
  max_concurrent: 10
  timeout: 300  # 5分钟超时
  retry_attempts: 3

# 存储配置
storage:
  type: postgresql  # 或 sqlite, redis
  connection_string: $DATABASE_URL

# 缓存配置
cache:
  enabled: true
  ttl: 3600  # 1小时
  backend: redis
  redis_url: $REDIS_URL

# 日志配置
logging:
  level: INFO
  format: json
  output: stdout

# 监控配置
monitoring:
  prometheus_enabled: true
  grafana_enabled: true
  sentry_dsn: $SENTRY_DSN
```

### 环境变量 (.env)

```bash
# .env

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-key

# 豆包 API Key
DOUBAO_API_KEY=your-doubao-key

# Tavily Search API Key
TAVILY_API_KEY=your-tavily-key

# InfoQuest API Key
INFOQUEST_API_KEY=your-infoquest-key

# GitHub Token (用于代码搜索)
GITHUB_TOKEN=ghp_your-github-token

# 数据库连接
DATABASE_URL=postgresql://user:pass@localhost:5432/deerflow

# Redis连接
REDIS_URL=redis://localhost:6379

# Sentry DSN (可选)
SENTRY_DSN=https://xxx@sentry.io/xxx

# DeerFlow API Key (用于外部调用)
DEERFLOW_API_KEY=your-deerflow-api-key
```

---

## Agent编排设计

### SkillHub专用Agent架构

```yaml
# skillhub_agents.yaml

agents:
  # 1. 搜索Agent
  search_agent:
    name: "Skill Discovery Agent"
    role: "Search Specialist"
    goal: "Discover AI Agent Skills from multiple sources"
    
    tools:
      - name: tavily_search
        type: search
        config:
          api_key: $TAVILY_API_KEY
          max_results: 20
      
      - name: github_search
        type: code_search
        config:
          token: $GITHUB_TOKEN
      
      - name: skillsmp_api
        type: api_call
        config:
          base_url: https://api.skillsmp.com/v1
          api_key: $SKILLSMP_API_KEY
    
    instructions: |
      You are an expert at discovering AI Agent Skills.
      
      Your task is to search across multiple platforms:
      1. GitHub: Search for repositories with SKILL.md
      2. SkillsMP: Query their API for trending skills
      3. General web: Find new Skill announcements
      
      For each discovered skill, extract:
      - Name and description
      - Repository URL
      - Author information
      - Tags and categories
      - Last update time
      
      Return results in structured JSON format.
    
    output_format:
      type: json
      schema:
        skills: array
        total: number
        sources: array

  # 2. 爬虫Agent
  crawler_agent:
    name: "Skill Crawler Agent"
    role: "Crawling Specialist"
    goal: "Extract detailed information from Skill repositories"
    
    tools:
      - name: web_scraper
        type: browser
        config:
          headless: true
          timeout: 30
      
      - name: file_reader
        type: filesystem
        config:
          allowed_paths: ["*.md", "*.json", "*.yaml"]
      
      - name: markdown_parser
        type: parser
        config:
          extract_frontmatter: true
    
    instructions: |
      You are an expert at crawling and parsing Skill repositories.
      
      Given a repository URL, your task is to:
      1. Clone or download the repository
      2. Locate and read SKILL.md file
      3. Parse frontmatter metadata
      4. Extract main content
      5. Read package.json for dependencies
      6. Analyze code structure
      
      Validate that:
      - SKILL.md exists and is well-formed
      - Required fields are present
      - Dependencies are reasonable
      - No security issues detected
      
      Return comprehensive skill data.
    
    output_format:
      type: json
      schema:
        metadata: object
        content: string
        dependencies: object
        permissions: array
        quality_indicators: object

  # 3. 验证Agent
  validator_agent:
    name: "Quality Validator Agent"
    role: "QA Specialist"
    goal: "Validate and score Skill quality"
    
    tools:
      - name: code_analyzer
        type: static_analysis
        config:
          languages: ["typescript", "python", "javascript"]
      
      - name: security_scanner
        type: security
        config:
          check_permissions: true
          check_dependencies: true
      
      - name: quality_scorer
        type: custom
        config:
          weights:
            documentation: 0.3
            code_quality: 0.25
            activity: 0.2
            community: 0.15
            security: 0.1
    
    instructions: |
      You are an expert at evaluating Skill quality.
      
      Analyze the skill data and assign scores:
      
      1. Documentation (30%):
         - Description completeness
         - README quality
         - Examples provided
      
      2. Code Quality (25%):
         - Code structure
         - Best practices
         - Error handling
      
      3. Activity (20%):
         - Last update time
         - Commit frequency
         - Issue resolution
      
      4. Community (15%):
         - Star count
         - Download count
         - Fork count
      
      5. Security (10%):
         - Permission合理性
         - 依赖安全性
         - 无恶意代码
      
      Calculate overall quality score (0-100).
      Flag any critical issues.
    
    output_format:
      type: json
      schema:
        quality_score: number
        dimension_scores: object
        issues: array
        recommendations: array
        passed: boolean

  # 4. 索引Agent
  indexer_agent:
    name: "Search Indexer Agent"
    role: "Indexing Specialist"
    goal: "Prepare Skills for search indexing"
    
    tools:
      - name: embedding_generator
        type: ai
        config:
          model: text-embedding-3-small
          dimensions: 1536
      
      - name: keyword_extractor
        type: nlp
        config:
          algorithm: tf-idf
      
      - name: database_writer
        type: database
        config:
          connection: $DATABASE_URL
    
    instructions: |
      You are an expert at preparing data for search.
      
      Process the validated skill data:
      1. Generate text embeddings for semantic search
      2. Extract keywords for full-text search
      3. Normalize and clean metadata
      4. Prepare for database insertion
      
      Optimize for:
      - Fast retrieval
      - Accurate matching
      - Efficient storage
    
    output_format:
      type: json
      schema:
        indexed: boolean
        embedding_id: string
        keywords: array
        metadata: object
```

### Agent协作流程

```mermaid
graph TB
    A[定时触发器] --> B[Search Agent]
    B --> C[发现候选Skills]
    C --> D{过滤已存在}
    D -->|新Skill| E[Crawler Agent]
    D -->|已存在| F[跳过]
    E --> G[提取详细信息]
    G --> H[Validator Agent]
    H --> I{质量检查}
    I -->|≥60分| J[Indexer Agent]
    I -->|<60分| K[记录拒绝]
    J --> L[生成Embeddings]
    L --> M[存入数据库]
    M --> N[更新搜索索引]
    N --> O[发送通知]
    K --> P[错误日志]
    F --> Q[统计计数]
    O --> Q
    P --> Q
    Q --> R[生成报告]
```

---

## 自定义Skills开发

### Skill模板

```typescript
// skills/skillhub-discovery.ts

import { Skill, SkillContext } from '@deerflow/core';

interface DiscoveryParams {
  query: string;
  sources?: string[];
  limit?: number;
  filters?: {
    category?: string;
    language?: string;
    minStars?: number;
  };
}

interface DiscoveryResult {
  skills: DiscoveredSkill[];
  total: number;
  sources: string[];
  timestamp: string;
}

interface DiscoveredSkill {
  name: string;
  description: string;
  repository_url: string;
  author: string;
  stars: number;
  tags: string[];
  source: string;
}

export const skillhubDiscoverySkill: Skill = {
  name: 'skillhub-discovery',
  description: 'Discover AI Agent Skills from multiple sources',
  version: '1.0.0',
  author: 'SkillHub Team',
  
  parameters: {
    query: { 
      type: 'string', 
      required: true,
      description: 'Search query'
    },
    sources: { 
      type: 'array', 
      default: ['github', 'skillsmp'],
      description: 'Data sources to search'
    },
    limit: { 
      type: 'number', 
      default: 20,
      description: 'Maximum results to return'
    },
    filters: {
      type: 'object',
      optional: true,
      description: 'Filter criteria'
    },
  },
  
  async execute(params: DiscoveryParams, context: SkillContext): Promise<DiscoveryResult> {
    const { query, sources = ['github', 'skillsmp'], limit = 20, filters } = params;
    
    context.logger.info(`Starting discovery for: ${query}`);
    
    const results: DiscoveredSkill[] = [];
    
    // Search GitHub
    if (sources.includes('github')) {
      context.logger.info('Searching GitHub...');
      const githubResults = await this.searchGitHub(query, filters);
      results.push(...githubResults);
    }
    
    // Search SkillsMP
    if (sources.includes('skillsmp')) {
      context.logger.info('Searching SkillsMP...');
      const skillsmpResults = await this.searchSkillsMP(query, filters);
      results.push(...skillsmpResults);
    }
    
    // Deduplicate
    const unique = this.deduplicate(results);
    
    // Rank by relevance
    const ranked = this.rankByRelevance(unique, query);
    
    context.logger.info(`Found ${ranked.length} unique skills`);
    
    return {
      skills: ranked.slice(0, limit),
      total: unique.length,
      sources,
      timestamp: new Date().toISOString(),
    };
  },
  
  private async searchGitHub(query: string, filters?: any): Promise<DiscoveredSkill[]> {
    // 实现GitHub搜索逻辑
    const response = await fetch('https://api.github.com/search/repositories', {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      },
      query: {
        q: `${query} filename:SKILL.md`,
        sort: 'stars',
        order: 'desc',
      },
    });
    
    const data = await response.json();
    
    return data.items.map((repo: any) => ({
      name: repo.name,
      description: repo.description,
      repository_url: repo.html_url,
      author: repo.owner.login,
      stars: repo.stargazers_count,
      tags: repo.topics || [],
      source: 'github',
    }));
  },
  
  private async searchSkillsMP(query: string, filters?: any): Promise<DiscoveredSkill[]> {
    // 实现SkillsMP搜索逻辑
    const response = await fetch(`https://api.skillsmp.com/v1/skills/search?q=${query}`, {
      headers: {
        'X-API-Key': process.env.SKILLSMP_API_KEY!,
      },
    });
    
    const data = await response.json();
    
    return data.data.map((skill: any) => ({
      name: skill.name,
      description: skill.description,
      repository_url: skill.repository_url,
      author: skill.author,
      stars: skill.stars,
      tags: skill.tags || [],
      source: 'skillsmp',
    }));
  },
  
  private deduplicate(skills: DiscoveredSkill[]): DiscoveredSkill[] {
    const seen = new Set<string>();
    return skills.filter(skill => {
      const key = `${skill.name}:${skill.author}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },
  
  private rankByRelevance(skills: DiscoveredSkill[], query: string): DiscoveredSkill[] {
    // 简单的相关性排序
    return skills.sort((a, b) => {
      // 优先stars多的
      const starDiff = b.stars - a.stars;
      if (Math.abs(starDiff) > 10) return starDiff;
      
      // 其次看描述匹配度
      const aMatch = a.description.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bMatch = b.description.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      return bMatch - aMatch;
    });
  },
};
```

### 注册Skill

```typescript
// skills/index.ts

import { skillhubDiscoverySkill } from './skillhub-discovery';
import { skillhubCrawlerSkill } from './skillhub-crawler';
import { skillhubValidatorSkill } from './skillhub-validator';
import { skillhubIndexerSkill } from './skillhub-indexer';

export const skillhubSkills = [
  skillhubDiscoverySkill,
  skillhubCrawlerSkill,
  skillhubValidatorSkill,
  skillhubIndexerSkill,
];

// 在DeerFlow中注册
export function registerSkillhubSkills(deerflow: DeerFlowApp) {
  for (const skill of skillhubSkills) {
    deerflow.registerSkill(skill);
  }
}
```

---

## 流水线集成

### 完整流水线实现

```typescript
// lib/pipelines/SkillDiscoveryPipeline.ts

import { DeerFlowClient } from '@deerflow/client';
import cron from 'node-cron';
import { prisma } from '@/lib/prisma';

export interface PipelineConfig {
  schedule?: string;
  sources?: string[];
  batchSize?: number;
  minQualityScore?: number;
  notifyOnComplete?: boolean;
}

export class SkillDiscoveryPipeline {
  private client: DeerFlowClient;
  private config: PipelineConfig;
  
  constructor(config: PipelineConfig = {}) {
    this.config = {
      schedule: '0 3 * * *', // 每天凌晨3点
      sources: ['github', 'skillsmp'],
      batchSize: 50,
      minQualityScore: 60,
      notifyOnComplete: true,
      ...config,
    };
    
    this.client = new DeerFlowClient({
      baseUrl: process.env.DEERFLOW_URL || 'http://localhost:2026',
      apiKey: process.env.DEERFLOW_API_KEY,
    });
  }
  
  /**
   * 执行完整的发现流水线
   */
  async run(): Promise<PipelineResult> {
    const startTime = Date.now();
    
    console.log('🚀 Starting Skill discovery pipeline...');
    
    try {
      // 记录任务开始
      const task = await this.createTask('discovery_pipeline');
      
      // Step 1: 搜索发现
      console.log('📡 Step 1: Discovering skills...');
      const discovered = await this.discoverSkills();
      console.log(`✅ Found ${discovered.length} candidate skills`);
      
      // Step 2: 并行处理
      console.log('🔄 Step 2: Processing skills...');
      const results = await this.processBatch(discovered);
      
      // Step 3: 统计结果
      const success = results.filter(r => r.status === 'success').length;
      const failed = results.filter(r => r.status === 'failed').length;
      const skipped = results.filter(r => r.status === 'skipped').length;
      
      const duration = Date.now() - startTime;
      
      console.log(`✨ Pipeline completed in ${duration}ms`);
      console.log(`   Success: ${success}, Failed: ${failed}, Skipped: ${skipped}`);
      
      // 更新任务状态
      await this.updateTask(task.id, {
        status: 'completed',
        completedAt: new Date(),
        result: { success, failed, skipped, duration },
      });
      
      // 发送通知
      if (this.config.notifyOnComplete) {
        await this.sendNotification({ success, failed, skipped, duration });
      }
      
      return { success, failed, skipped, duration };
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      throw error;
    }
  }
  
  /**
   * 发现新Skills
   */
  private async discoverSkills(): Promise<CandidateSkill[]> {
    const result = await this.client.executeSkill('skillhub-discovery', {
      query: 'AI Agent SKILL.md',
      sources: this.config.sources,
      limit: this.config.batchSize * 2, // 获取更多用于过滤
    });
    
    // 过滤已存在的
    const existing = await this.getExistingSkills(result.skills);
    const newSkills = result.skills.filter(s => !existing.has(s.repository_url));
    
    return newSkills.slice(0, this.config.batchSize);
  }
  
  /**
   * 批量处理Skills
   */
  private async processBatch(skills: CandidateSkill[]): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    // 分批并行处理
    const chunks = this.chunk(skills, 5); // 每批5个
    
    for (const chunk of chunks) {
      const batchResults = await Promise.allSettled(
        chunk.map(skill => this.processSingleSkill(skill))
      );
      
      results.push(...batchResults.map((r, i) => ({
        skill: chunk[i],
        status: r.status === 'fulfilled' ? 'success' : 'failed',
        error: r.status === 'rejected' ? r.reason.message : undefined,
      })));
      
      // 避免速率限制
      await this.sleep(2000);
    }
    
    return results;
  }
  
  /**
   * 处理单个Skill
   */
  private async processSingleSkill(skill: CandidateSkill): Promise<void> {
    try {
      // Crawler Agent提取详细信息
      console.log(`  🕷️ Crawling: ${skill.name}`);
      const crawled = await this.client.executeSkill('skillhub-crawler', {
        repository_url: skill.repository_url,
      });
      
      // Validator Agent验证质量
      console.log(`  ✓ Validating: ${skill.name}`);
      const validated = await this.client.executeSkill('skillhub-validator', {
        skill_data: crawled,
      });
      
      if (validated.quality_score < this.config.minQualityScore!) {
        console.log(`  ✗ Low quality (${validated.quality_score}): ${skill.name}`);
        await this.recordRejection(skill, `Quality score too low: ${validated.quality_score}`);
        return;
      }
      
      // Indexer Agent建立索引
      console.log(`  📝 Indexing: ${skill.name}`);
      await this.client.executeSkill('skillhub-indexer', {
        skill_data: validated,
      });
      
      console.log(`  ✅ Success: ${skill.name}`);
    } catch (error) {
      console.error(`  ❌ Failed: ${skill.name}`, error);
      throw error;
    }
  }
  
  /**
   * 设置定时任务
   */
  setupSchedule(): void {
    cron.schedule(this.config.schedule!, async () => {
      console.log('⏰ Running scheduled discovery pipeline...');
      try {
        await this.run();
      } catch (error) {
        console.error('Scheduled pipeline failed:', error);
        await this.sendAlert(error);
      }
    });
    
    console.log(`⏱️ Discovery pipeline scheduled: ${this.config.schedule}`);
  }
  
  // 辅助方法...
  private chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private async getExistingSkills(urls: string[]): Promise<Set<string>> {
    const skills = await prisma.skill.findMany({
      where: {
        repositoryUrl: { in: urls },
      },
      select: { repositoryUrl: true },
    });
    return new Set(skills.map(s => s.repositoryUrl!));
  }
  
  private async createTask(type: string) {
    return await prisma.crawlerTask.create({
      data: {
        taskType: type,
        status: 'running',
        scheduledAt: new Date(),
      },
    });
  }
  
  private async updateTask(id: string, data: any) {
    await prisma.crawlerTask.update({
      where: { id },
      data,
    });
  }
  
  private async recordRejection(skill: CandidateSkill, reason: string) {
    // 记录拒绝原因
  }
  
  private async sendNotification(result: any) {
    // 发送通知（邮件、Slack等）
  }
  
  private async sendAlert(error: any) {
    // 发送告警
  }
}
```

### 启动流水线

```typescript
// lib/cron/skillDiscovery.ts

import { SkillDiscoveryPipeline } from '../pipelines/SkillDiscoveryPipeline';

// 创建流水线实例
const pipeline = new SkillDiscoveryPipeline({
  schedule: '0 3 * * *', // 每天凌晨3点
  sources: ['github', 'skillsmp'],
  batchSize: 50,
  minQualityScore: 60,
  notifyOnComplete: true,
});

// 设置定时任务
pipeline.setupSchedule();

console.log('✅ Skill discovery pipeline initialized');
```

---

## API集成

### REST API调用

```typescript
// 通过HTTP API调用DeerFlow

async function executeViaAPI() {
  const response = await fetch('http://localhost:2026/api/v1/execute', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEERFLOW_API_KEY}`,
    },
    body: JSON.stringify({
      skill: 'skillhub-discovery',
      params: {
        query: 'inventory management',
        sources: ['github', 'skillsmp'],
        limit: 20,
      },
    }),
  });
  
  const result = await response.json();
  console.log(result);
}
```

### WebSocket实时响应

```typescript
// 流式响应

const ws = new WebSocket('ws://localhost:2026/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'execute_skill',
    skill: 'skillhub-discovery',
    params: { query: 'AI agent' },
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'progress') {
    console.log(`Progress: ${data.progress}%`);
  } else if (data.type === 'result') {
    console.log('Result:', data.result);
  } else if (data.type === 'error') {
    console.error('Error:', data.error);
  }
};
```

---

## 监控与运维

### Prometheus指标

```yaml
# 关键指标

# 流水线执行
pipeline_executions_total{status="success|failed"}
pipeline_duration_seconds

# Agent执行
agent_executions_total{agent="search|crawler|validator|indexer"}
agent_duration_seconds{agent="..."}

# 数据处理
skills_discovered_total
skills_processed_total{status="success|failed|skipped"}
skills_indexed_total

# 系统资源
cpu_usage_percent
memory_usage_bytes
active_connections
```

### Grafana仪表板

![Grafana Dashboard示例](https://example.com/grafana-dashboard.png)

**关键面板**:
1. 流水线执行趋势
2. Agent性能指标
3. 数据处理统计
4. 系统资源监控
5. 错误率和告警

### 日志聚合

```typescript
// 结构化日志

import pino from 'pino';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-elasticsearch',
    options: {
      node: 'http://localhost:9200',
      index: 'deerflow-logs',
    },
  },
});

// 使用
logger.info({
  event: 'pipeline_started',
  timestamp: new Date().toISOString(),
  config: { /* ... */ },
});

logger.error({
  event: 'pipeline_failed',
  error: error.message,
  stack: error.stack,
});
```

---

## 最佳实践

### 1. 性能优化

- **批量处理**: 减少API调用次数
- **并行执行**: 利用多Agent并发
- **缓存结果**: 避免重复计算
- **异步处理**: 不阻塞主线程

### 2. 错误处理

- **重试机制**: 临时失败自动重试
- **降级策略**: 部分失败不影响整体
- **详细日志**: 便于问题定位
- **告警通知**: 及时发现异常

### 3. 安全考虑

- **API Key管理**: 使用环境变量
- **沙盒执行**: 隔离不可信代码
- **速率限制**: 防止滥用
- **输入验证**: 防止注入攻击

### 4. 成本控制

- **模型选择**: 根据任务复杂度选择
- **Token监控**: 设置预算上限
- **缓存复用**: 减少重复调用
- **按需执行**: 避免不必要的运行

---

## 故障排查

### 问题1: DeerFlow服务无法启动

**症状**: Docker容器启动失败

**解决**:
```bash
# 查看日志
docker logs deerflow

# 检查配置
cat config.yaml

# 验证环境变量
docker exec -it deerflow env | grep API_KEY

# 重新初始化
make docker-clean
make docker-init
make docker-start
```

### 问题2: Agent执行超时

**原因**: 任务复杂度高或网络慢

**解决**:
1. 增加timeout配置
2. 优化Agent指令
3. 检查网络连接
4. 使用更快的模型

### 问题3: Skills发现数量为0

**原因**: 搜索条件太严格或API问题

**解决**:
```typescript
// 放宽搜索条件
const result = await client.executeSkill('skillhub-discovery', {
  query: 'SKILL.md', // 更通用的查询
  sources: ['github'], // 先测试单一来源
  limit: 100, // 增加数量
});
```

### 问题4: 质量评分过低

**原因**: 验证标准过高

**解决**:
- 调整minQualityScore阈值
- 优化Validator Agent指令
- 检查评分权重配置

---

## 总结

通过本指南，您已经完成了DeerFlow 2.0与SkillHub的集成。关键要点：

✅ 正确部署和配置DeerFlow  
✅ 设计专业的Agent角色和工具  
✅ 开发自定义Skills  
✅ 构建自动化发现流水线  
✅ 实现监控和告警  

DeerFlow 2.0为SkillHub提供了强大的智能调度能力，使Skills发现和更新完全自动化、智能化。

---

**相关文档**:
- [GLOBAL_SKILLS_SEARCH_PLAN.md](./GLOBAL_SKILLS_SEARCH_PLAN.md) - v2.0整体规划
- [SKILLSMP_INTEGRATION_GUIDE.md](./SKILLSMP_INTEGRATION_GUIDE.md) - SkillsMP集成指南
- [SKILL_SEEKERS_CRAWLER_GUIDE.md](./SKILL_SEEKERS_CRAWLER_GUIDE.md) - Skill Seekers爬虫配置
- [GLOBAL_SEARCH_ARCHITECTURE.md](./GLOBAL_SEARCH_ARCHITECTURE.md) - 搜索架构设计

**支持**:
- GitHub Issues: https://github.com/bytedance/deer-flow/issues
- 官方文档: https://deerflow.tech/docs
- 社区Discord: https://discord.gg/deerflow

---

_文档版本: v1.0_  
_最后更新: 2026-04-18_  
_作者: SkillHub Team_

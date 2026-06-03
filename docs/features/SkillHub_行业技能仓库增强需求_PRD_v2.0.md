# SkillHub 行业技能仓库增强需求（PRD v2.0）

> 项目：SkillHub（`skillhub.proclaw.cc`）
> 版本：v2.0
> 关联文档：ProClaw 插件系统 PRD——行业工作流插件（PRD v10.0）、Nvwax Agent平台行业插件增强需求（PRD v2.0）
> 目标：为 SkillHub 增加行业技能分类、结构化知识片段和业务规则能力，为 Nvwax Agent 和 ProClaw 插件提供更丰富的技能来源。

---

## 一、背景与目标

### 1.1 背景

- SkillHub v1.x 主要存储提示词模板和通用技能（`prompt` 类型）。
- ProClaw v10.0 引入行业工作流插件（餐饮、维修、零售等），每个插件需要特定的行业知识（如菜品分类、手机维修故障码、业务规则）。
- Nvwax Agent 需要从 SkillHub 拉取行业相关技能，组装成 Agent 的上下文提示词。
- 当前 SkillHub 的数据模型和 API 不支持结构化知识片段和行业标签，无法满足上述需求。

### 1.2 目标

- 扩展 SkillHub 的技能类型体系，支持 `knowledge`（结构化知识片段）、`rule`（业务规则）、`skill_pack`（技能组合包）。
- 新增行业标签体系，支持按行业维度检索技能。
- 支持 CSV/JSON 知识片段上传、版本管理和向量化检索（pgvector）。
- 提供 API v2 端点供 Nvwax 和 ProClaw 消费。
- 更新开发者控制台，支持新的技能类型和知识片段管理。

---

## 二、功能需求

### 2.1 新增技能类型

SkillHub 原仅支持 `prompt`（通用提示词模板）类型。v2.0 增加以下类型：

| 类型 | 标识 | 说明 | 示例 |
|------|------|------|------|
| 提示词模板 | `prompt` | 通用提示词模板（已有） | "生成抖音文案" |
| 知识片段 | `knowledge` | 结构化知识片段（JSON/CSV），可向量化检索 | 餐厅菜品分类表、手机型号与配件对应表 |
| 业务规则 | `rule` | if-then 条件规则，可被 Agent 编排引擎解析执行 | "如果订单总价 > 100 元，则自动赠送小礼品" |
| 技能组合包 | `skill_pack` | 包含多个子技能的集合体 | 维修工单工作流所需的故障诊断技能集 |

### 2.2 技能元数据扩展

在现有技能元数据基础上增加以下字段：

```
现有字段：
- id, name, description, type, content, author, version, created_at, updated_at

新增字段：
- industry_tags: string[]        -- 行业标签，如 ["餐饮", "零售", "维修"]
- plugin_compatible: boolean     -- 是否可与 ProClaw 插件联动
- plugin_ids: string[]           -- 关联的 ProClaw 插件 ID 列表（可选）
- input_schema: JSON Schema      -- 定义该技能的输入数据格式
- output_schema: JSON Schema     -- 定义该技能的输出数据格式
- category_path: string          -- 分类路径，如 "餐饮/菜品管理/分类"
- locale: string                 -- 语言区域，如 "zh-CN", "en-US"
```

#### 2.2.1 行业标签规范

`industry_tags` 取值应遵循以下统一标签体系：

| 标签 | 说明 | 关联插件 ID |
|------|------|-------------|
| `餐饮` | 餐饮行业相关 | `catering` |
| `美业` | 美业（美容/美发/美甲） | `beauty` |
| `宠物` | 宠物行业 | `pet` |
| `零售` | 通用零售 | `retail` |
| `进销存` | 库存/供应链管理 | `inventory` |
| `云服务` | 云平台运维 | `cloud-proclaw` |
| `虚拟公司` | 虚拟企业运营 | `virtual-company` |
| `维修` | 维修工单 | - |
| `通用` | 跨行业通用技能 | - |

### 2.3 知识片段管理

#### 2.3.1 存储模型

知识片段（`knowledge` 类型技能）包含以下结构：

```json
{
  "id": "knowledge-catering-dish-category",
  "skill_id": "skill-xxx",
  "version": 3,
  "content_type": "json",          // "json" | "csv" | "text"
  "content": { ... },              // 原始内容（JSON 对象或 CSV 文本）
  "vectorized": true,              // 是否已向量化
  "chunk_count": 15,               // 向量分块数
  "metadata": {
    "source": "upload",            // "upload" | "manual" | "generated"
    "size_bytes": 20480,
    "row_count": 150,
    "columns": ["category_id", "category_name", "parent_id", "sort_order"]
  },
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-03-20T10:30:00Z"
}
```

#### 2.3.2 上传流程

1. 用户在开发者控制台选择 `knowledge` 类型的技能
2. 上传 CSV 或 JSON 文件
3. 系统解析文件结构，预览前 5 行数据
4. 用户确认字段映射关系（可选）
5. 保存原始内容 + 自动向量化分块（调用 pgvector）
6. 标记 `vectorized = true`

#### 2.3.3 向量化存储

- 使用 PostgreSQL `pgvector` 扩展
- 分块策略：JSON 按顶层键值对拆分，CSV 按行拆分
- 嵌入模型：使用 OpenAI `text-embedding-3-small` 或兼容模型
- 索引类型：IVFFlat（默认）或 HNSW（大数据量）

向量化表结构：

```sql
create table if not exists knowledge_embeddings (
  id uuid default gen_random_uuid() primary key,
  skill_id text not null,
  knowledge_id text not null,
  chunk_index integer not null,
  chunk_text text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_knowledge_embeddings_skill on knowledge_embeddings(skill_id);
-- 向量索引（使用 pgvector）
create index idx_knowledge_embeddings_vector on knowledge_embeddings
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);
```

#### 2.3.4 版本控制

- 每次更新知识片段内容，版本号 +1
- 保留历史版本（保留最近 20 个版本或永久保留）
- 支持回滚到指定版本
- 版本发布时可附带 changelog 说明

版本历史表：

```sql
create table if not exists knowledge_versions (
  id uuid default gen_random_uuid() primary key,
  skill_id text not null,
  knowledge_id text not null,
  version integer not null,
  content_snapshot jsonb not null,
  changelog text,
  created_by text,
  created_at timestamptz default now()
);
```

### 2.4 业务规则引擎

`rule` 类型技能的结构：

```json
{
  "id": "rule-catering-free-dessert",
  "type": "rule",
  "name": "满额赠送甜品",
  "conditions": [
    {
      "field": "order.total_amount",
      "operator": "greater_than",
      "value": 100
    },
    {
      "field": "order.customer.is_member",
      "operator": "equals",
      "value": true
    }
  ],
  "actions": [
    {
      "type": "add_order_item",
      "params": {
        "product_id": "dessert-free-001",
        "name": "赠送甜品（芒果布丁）",
        "price": 0,
        "reason": "会员满100元赠送"
      }
    },
    {
      "type": "send_notification",
      "params": {
        "target": "waiter",
        "message": "3号桌会员满额，已自动赠送甜品"
      }
    }
  ],
  "priority": 1,
  "enabled": true
}
```

规则引擎应支持：
- 条件组合（AND/OR/NOT）
- 数值、字符串、布尔、数组四种字段类型
- 运算符：`equals`, `not_equals`, `greater_than`, `less_than`, `contains`, `in`, `between`
- 动作链（多动作顺序执行）
- 优先级排序（数字越小优先级越高）
- 启用/禁用开关

### 2.5 API v2 端点

#### 基础 URL：`https://skillhub.proclaw.cc/api/v2`

#### 技能相关

| 端点 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/skills` | GET | 获取技能列表 | `type`（按类型过滤）, `industry_tags[]`（按行业标签过滤）, `q`（搜索关键词）, `page`, `limit`, `plugin_compatible` |
| `/skills/:id` | GET | 获取技能详情 | - |
| `/skills/:id/versions` | GET | 获取版本历史 | `page`, `limit` |
| `/skills/:id/versions/:version` | GET | 获取指定版本快照 | - |

#### 知识片段相关

| 端点 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/skills/:id/knowledge` | GET | 获取知识片段内容 | `format`（json/csv）, `version`（指定版本） |
| `/skills/:id/knowledge` | POST | 创建/更新知识片段 | `content`（JSON/CSV 内容）, `changelog` |
| `/skills/:id/vector_search` | POST | 向量检索知识片段 | `query`（检索文本）, `top_k`（返回条数，默认5）, `threshold`（相似度阈值，默认0.7） |
| `/skills/:id/vector_search/by_embedding` | POST | 使用已有向量检索 | `embedding`（向量数组）, `top_k`, `threshold` |

**`GET /skills` 示例响应：**

```json
{
  "data": [
    {
      "id": "skill-catering-001",
      "name": "菜品分类与推荐知识",
      "type": "knowledge",
      "industry_tags": ["餐饮"],
      "plugin_compatible": true,
      "plugin_ids": ["catering"],
      "version": 3,
      "description": "包含中餐菜品分类、口味标签、季节推荐等结构化知识",
      "input_schema": { ... },
      "output_schema": { ... },
      "created_at": "2026-01-10T00:00:00Z",
      "updated_at": "2026-03-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

**`POST /skills/:id/vector_search` 请求/响应：**

```
POST /skills/:id/vector_search
Content-Type: application/json

{
  "query": "适合不吃辣的顾客推荐什么菜？",
  "top_k": 5,
  "threshold": 0.7
}

---

{
  "results": [
    {
      "chunk_index": 3,
      "chunk_text": "清淡菜品分类：粤菜类、蒸菜类、汤品类。推荐：清蒸鱼、白灼虾、上汤娃娃菜...",
      "score": 0.89,
      "metadata": {
        "category": "清淡推荐",
        "tags": ["不辣", "清淡", "推荐"]
      }
    }
  ],
  "total": 5
}
```

---

## 三、开发者控制台增强

### 3.1 技能创建流程

创建技能时，新增以下步骤：

1. **选择技能类型**：prompt / knowledge / rule / skill_pack
2. **填写基础信息**：名称、描述、行业标签、语言
3. **配置 Schema**（可选）：
   - 定义 `input_schema` / `output_schema`（JSON Schema 编辑器）
   - 规则条件/动作配置（`rule` 类型专用）
4. **上传/编辑内容**：
   - `knowledge` 类型：CSV/JSON 文件上传 + 预览
   - `rule` 类型：可视化条件编辑器
   - `skill_pack` 类型：选择子技能清单
5. **关联插件**（可选）：选择关联的 ProClaw 插件 ID
6. **发布版本**：附带 changelog

### 3.2 知识片段管理界面

- 文件上传区（支持拖拽）
- 预览表格（CSV 自动渲染为表格，JSON 渲染为树形结构）
- 字段映射编辑器（自动识别列名，支持重命名）
- 测试检索面板：输入查询文本，实时显示向量检索结果及相似度分数
- 版本历史时间线：显示每次更新的 changelog 和差异对比

---

## 四、与 Nvwax 的协同

### 4.1 Agent 技能拉取流程

1. Nvwax 在构建 Agent 时调用 `GET /v2/skills?industry_tags=[]&type=knowledge` 获取行业相关技能
2. Nvwax 将技能内容注入 Agent 的系统提示词
3. Agent 运行时可通过向量检索接口 `POST /skills/:id/vector_search` 实时查询知识库

### 4.2 ProClaw 联动流程

1. ProClaw 安装行业插件后，向 SkillHub 请求该插件关联的技能列表
2. ProClaw 将技能推荐给用户，询问是否安装对应的 AI Team
3. Agent 执行动作后，可将结果保存回 SkillHub 知识库（需授权），形成经验积累闭环

### 4.3 接口协议

SkillHub 与 Nvwax 之间的认证使用 API Key（在 SkillHub 开发者控制台生成），通过 `Authorization: Bearer <api_key>` header 传递。

---

## 五、安全与隐私

- 知识片段访问权限控制：技能创建者可设置公开/私有
- 私有技能仅创建者和授权的 ProClaw 实例可访问
- 上传文件大小限制：单个 CSV/JSON 不超过 10MB
- 向量化内容不存储原始敏感数据（如用户个人信息）
- API 调用频率限制：普通用户 100 次/分钟，认证开发者 1000 次/分钟

---

## 六、数据库迁移

### 6.1 技能表扩展

```sql
-- 为现有 skills 表增加新字段
alter table if exists skills
  add column if not exists industry_tags text[] default '{}',
  add column if not exists plugin_compatible boolean default false,
  add column if not exists plugin_ids text[] default '{}',
  add column if not exists input_schema jsonb,
  add column if not exists output_schema jsonb,
  add column if not exists category_path text,
  add column if not exists locale text default 'zh-CN';

-- 新增知识片段表
create table if not exists knowledge_fragments (
  id text primary key,
  skill_id text not null references skills(id) on delete cascade,
  version integer default 1,
  content_type text not null check (content_type in ('json', 'csv', 'text')),
  content jsonb,
  raw_content text,
  vectorized boolean default false,
  chunk_count integer default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 新增版本历史表
create table if not exists knowledge_versions (
  id uuid default gen_random_uuid() primary key,
  skill_id text not null,
  knowledge_id text not null,
  version integer not null,
  content_snapshot jsonb not null,
  changelog text,
  created_by text,
  created_at timestamptz default now()
);

-- 新增向量嵌入表（依赖 pgvector）
create table if not exists knowledge_embeddings (
  id uuid default gen_random_uuid() primary key,
  skill_id text not null,
  knowledge_id text not null,
  chunk_index integer not null,
  chunk_text text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz default now()
);

-- 索引
create index if not exists idx_kf_skill on knowledge_fragments(skill_id);
create index if not exists idx_kv_skill_version on knowledge_versions(skill_id, knowledge_id, version);
create index if not exists idx_ke_skill on knowledge_embeddings(skill_id);
```

---

## 七、实施路线图

| 阶段 | 时间 | 任务 |
|------|------|------|
| 1 | 1 周 | 数据库迁移：skills 表增加字段，新建 knowledge_fragments / knowledge_versions / knowledge_embeddings 表 |
| 2 | 1 周 | 核心功能：知识片段上传/解析/向量化（pgvector），API v2 端点开发 |
| 3 | 1 周 | 业务规则引擎：规则解析与执行引擎，API 集成 |
| 4 | 1 周 | 开发者控制台：技能类型选择、Schema 编辑器、知识片段管理 UI、测试检索面板 |
| 5 | 1 周 | Nvwax 集成联调：验证 Agent 拉取技能 -> 向量检索 -> 注入提示词的全链路 |
| 6 | 3 天 | 上线准备：API 限流、权限控制、文档、监控 |

---

## 八、验收标准

1. **技能类型**：可在控制台创建 prompt / knowledge / rule / skill_pack 四种类型的技能
2. **知识上传**：支持 CSV 和 JSON 文件上传，预览前 5 行数据
3. **向量检索**：`POST /skills/:id/vector_search` 返回 top_k 匹配结果，相似度评分准确
4. **行业过滤**：`GET /skills?industry_tags=餐饮` 只返回餐饮行业技能
5. **版本管理**：支持创建版本、查看历史、回滚
6. **联动验证**：Nvwax 可通过 API 获取到指定行业的 knowledge 技能内容
7. **性能**：向量检索请求响应时间 < 500ms（10000 条嵌入记录以内）

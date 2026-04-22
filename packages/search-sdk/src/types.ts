/**
 * Skill搜索结果
 */
export interface SkillSearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  version?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  languages?: string[];
  qualityScore?: number;
  starCount?: number;
  downloadCount?: number;
  authorName?: string;
  repositoryUrl?: string;
  documentationUrl?: string;
  source?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * 搜索响应
 */
export interface SearchResponse {
  skills: SkillSearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query?: string;
}

/**
 * 语义搜索结果
 */
export interface SemanticSearchResult extends SkillSearchResult {
  similarity: number; // 相似度分数 (0-1)
}

/**
 * 搜索建议
 */
export interface SearchSuggestion {
  text: string;
  type: 'skill' | 'category' | 'tag';
}

/**
 * 搜索选项
 */
export interface SearchOptions {
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
  /** 页码，默认 1 */
  page?: number;
  /** 每页数量，默认 20 */
  pageSize?: number;
  /** 排序方式，默认 relevance */
  sortBy?: 'relevance' | 'quality' | 'updated' | 'stars' | 'downloads';
}

/**
 * 语义搜索选项
 */
export interface SemanticSearchOptions {
  /** 搜索查询 */
  query: string;
  /** 返回结果数量，默认 20 */
  limit?: number;
  /** 最小相似度阈值 (0-1)，默认 0.3 */
  minSimilarity?: number;
  /** 分类过滤 */
  category?: string;
  /** 语言过滤 */
  language?: string;
  /** 数据源过滤 */
  source?: string;
}

/**
 * 高级搜索选项
 */
export interface AdvancedSearchOptions {
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
    from?: Date | string;
    to?: Date | string;
  };
  /** 页码，默认 1 */
  page?: number;
  /** 每页数量，默认 20 */
  pageSize?: number;
}

/**
 * 相关技能选项
 */
export interface RelatedSkillsOptions {
  /** 返回结果数量，默认 5 */
  limit?: number;
  /** 最小相似度阈值 (0-1)，默认 0.5 */
  minSimilarity?: number;
}

/**
 * SDK配置
 */
export interface SearchSDKConfig {
  /** API基础URL */
  apiUrl: string;
  /** API密钥（可选） */
  apiKey?: string;
  /** 请求超时时间（毫秒），默认 30000 */
  timeout?: number;
  /** 自定义请求头 */
  headers?: Record<string, string>;
}

/**
 * 错误响应
 */
export interface ErrorResponse {
  error: string;
  details?: string;
  hint?: string;
}

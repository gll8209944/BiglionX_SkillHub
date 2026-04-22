import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  SearchSDKConfig,
  SearchOptions,
  SearchResponse,
  SemanticSearchOptions,
  SemanticSearchResult,
  AdvancedSearchOptions,
  SearchSuggestion,
  RelatedSkillsOptions,
  ErrorResponse,
} from './types';

// 查询参数类型
type QueryParams = Record<string, string | number | boolean | string[] | object | undefined>;

/**
 * SkillHub搜索引擎SDK
 * 
 * 提供完整的搜索功能，包括：
 * - 全文搜索
 * - 语义搜索（基于向量相似度）
 * - 高级搜索（多条件组合）
 * - 搜索建议
 * - 相关技能推荐
 */
export class SearchSDK {
  private client: AxiosInstance;
  private config: SearchSDKConfig;

  constructor(config: SearchSDKConfig) {
    if (!config.apiUrl) {
      throw new Error('apiUrl is required');
    }

    this.config = {
      timeout: 30000,
      ...config,
    };

    // 创建axios实例
    this.client = axios.create({
      baseURL: config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // 添加认证头
    if (config.apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${config.apiKey}`;
    }

    // 添加错误处理
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        const errorMessage = error.response?.data?.error || error.message;
        const details = error.response?.data?.details;
        
        throw new Error(
          details ? `${errorMessage}: ${details}` : errorMessage
        );
      }
    );
  }

  /**
   * 执行全文搜索
   * 
   * @param options 搜索选项
   * @returns 搜索结果
   * 
   * @example
   * ```typescript
   * const results = await sdk.search({
   *   query: 'python automation',
   *   category: 'development',
   *   page: 1,
   *   pageSize: 20
   * });
   * ```
   */
  async search(options: SearchOptions): Promise<SearchResponse> {
    try {
      const params: QueryParams = {};
      
      if (options.query) params.q = options.query;
      if (options.category) params.category = options.category;
      if (options.subcategory) params.subcategory = options.subcategory;
      if (options.language) params.language = options.language;
      if (options.minQualityScore !== undefined) {
        params.minQuality = options.minQualityScore;
      }
      if (options.source) params.source = options.source;
      if (options.page !== undefined) params.page = options.page;
      if (options.pageSize !== undefined) params.pageSize = options.pageSize;
      if (options.sortBy) params.sortBy = options.sortBy;

      const response = await this.client.get<SearchResponse>('/search', {
        params,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, '搜索失败');
    }
  }

  /**
   * 执行语义搜索
   * 
   * 基于向量相似度理解查询意图，而不仅仅是关键词匹配
   * 
   * @param options 语义搜索选项
   * @returns 语义搜索结果（包含相似度分数）
   * 
   * @example
   * ```typescript
   * const results = await sdk.semanticSearch({
   *   query: '如何自动化处理Excel文件',
   *   limit: 10,
   *   minSimilarity: 0.5
   * });
   * ```
   */
  async semanticSearch(
    options: SemanticSearchOptions
  ): Promise<SemanticSearchResult[]> {
    try {
      const params: QueryParams = {
        query: options.query,
      };

      if (options.limit !== undefined) params.limit = options.limit;
      if (options.minSimilarity !== undefined) {
        params.minSimilarity = options.minSimilarity;
      }
      if (options.category) params.category = options.category;
      if (options.language) params.language = options.language;
      if (options.source) params.source = options.source;

      const response = await this.client.get<{
        results: SemanticSearchResult[];
      }>('/search/semantic', {
        params,
      });

      return response.data.results;
    } catch (error) {
      throw this.handleError(error, '语义搜索失败');
    }
  }

  /**
   * 执行高级搜索
   * 
   * 支持多条件组合搜索
   * 
   * @param options 高级搜索选项
   * @returns 搜索结果
   * 
   * @example
   * ```typescript
   * const results = await sdk.advancedSearch({
   *   query: 'data processing',
   *   categories: ['development', 'data-science'],
   *   languages: ['python', 'javascript'],
   *   minStars: 100,
   *   minQualityScore: 7.0
   * });
   * ```
   */
  async advancedSearch(
    options: AdvancedSearchOptions
  ): Promise<SearchResponse> {
    try {
      const body: QueryParams = {};

      if (options.query) body.query = options.query;
      if (options.categories) body.categories = options.categories;
      if (options.languages) body.languages = options.languages;
      if (options.sources) body.sources = options.sources;
      if (options.minStars !== undefined) body.minStars = options.minStars;
      if (options.minQualityScore !== undefined) {
        body.minQualityScore = options.minQualityScore;
      }
      if (options.dateRange) body.dateRange = options.dateRange;
      if (options.page !== undefined) body.page = options.page;
      if (options.pageSize !== undefined) body.pageSize = options.pageSize;

      const response = await this.client.post<SearchResponse>(
        '/search',
        body
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error, '高级搜索失败');
    }
  }

  /**
   * 获取搜索建议
   * 
   * @param query 查询前缀
   * @param limit 返回建议数量，默认 5
   * @returns 搜索建议列表
   * 
   * @example
   * ```typescript
   * const suggestions = await sdk.getSuggestions('pyt');
   * // [{ text: 'python', type: 'skill' }, ...]
   * ```
   */
  async getSuggestions(
    query: string,
    limit = 5
  ): Promise<SearchSuggestion[]> {
    try {
      const response = await this.client.get<{
        suggestions: SearchSuggestion[];
      }>('/search/suggestions', {
        params: { q: query, limit },
      });

      return response.data.suggestions;
    } catch (error) {
      throw this.handleError(error, '获取搜索建议失败');
    }
  }

  /**
   * 获取热门搜索词
   * 
   * @param limit 返回数量，默认 10
   * @returns 热门搜索词列表
   * 
   * @example
   * ```typescript
   * const popular = await sdk.getPopularSearches(10);
   * // ['python', 'automation', 'data-processing', ...]
   * ```
   */
  async getPopularSearches(limit = 10): Promise<string[]> {
    try {
      const response = await this.client.get<{
        popular: string[];
      }>('/search/popular', {
        params: { limit },
      });

      return response.data.popular;
    } catch (error) {
      throw this.handleError(error, '获取热门搜索失败');
    }
  }

  /**
   * 获取相关技能
   * 
   * 基于给定技能的embedding找到最相关的其他技能
   * 
   * @param skillId 技能ID
   * @param options 选项
   * @returns 相关技能列表
   * 
   * @example
   * ```typescript
   * const related = await sdk.getRelatedSkills('skill_123', {
   *   limit: 5,
   *   minSimilarity: 0.6
   * });
   * ```
   */
  async getRelatedSkills(
    skillId: string,
    options: RelatedSkillsOptions = {}
  ): Promise<SemanticSearchResult[]> {
    try {
      const params: QueryParams = {};
      
      if (options.limit !== undefined) params.limit = options.limit;
      if (options.minSimilarity !== undefined) {
        params.minSimilarity = options.minSimilarity;
      }

      const response = await this.client.get<{
        relatedSkills: SemanticSearchResult[];
      }>(`/skills/${skillId}/related`, {
        params,
      });

      return response.data.relatedSkills;
    } catch (error) {
      throw this.handleError(error, '获取相关技能失败');
    }
  }

  /**
   * 健康检查
   * 
   * 验证API连接是否正常
   * 
   * @returns 是否健康
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * 统一错误处理
   */
  private handleError(error: unknown, defaultMessage: string): Error {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data as ErrorResponse | undefined;
      
      if (responseData?.error) {
        const message = responseData.details
          ? `${responseData.error}: ${responseData.details}`
          : responseData.error;
        return new Error(message);
      }
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(defaultMessage);
  }
}

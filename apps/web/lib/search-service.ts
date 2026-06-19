/**
 * SkillHub搜索服务 - React/Next.js专用
 */

import { SearchSDK, SearchOptions, SemanticSearchOptions } from '@skillhub/search-sdk';

// 创建单例SDK实例
const sdk = new SearchSDK({
  apiUrl: process.env.NEXT_PUBLIC_SKILLHUB_API_URL || 'http://localhost:3000/api',
  timeout: 30000,
});

/**
 * 搜索Skills（带缓存）
 */
export async function searchSkills(options: SearchOptions) {
  const cacheKey = `search:${JSON.stringify(options)}`;
  
  // 检查SessionStorage缓存
  if (typeof window !== 'undefined') {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // 缓存5分钟
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  }

  const results = await sdk.search(options);
  
  // 缓存结果
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(cacheKey, JSON.stringify({
      data: results,
      timestamp: Date.now(),
    }));
  }

  return results;
}

/**
 * 语义搜索
 */
export async function semanticSearchSkills(options: SemanticSearchOptions) {
  return await sdk.semanticSearch(options);
}

/**
 * 获取搜索建议
 */
export async function getSearchSuggestions(query: string, limit = 5) {
  return await sdk.getSuggestions(query, limit);
}

/**
 * 获取热门搜索
 */
export async function getPopularSearches(limit = 10) {
  return await sdk.getPopularSearches(limit);
}

/**
 * 获取相关技能
 */
export async function getRelatedSkills(skillId: string, limit = 5) {
  return await sdk.getRelatedSkills(skillId, { limit });
}

export default sdk;

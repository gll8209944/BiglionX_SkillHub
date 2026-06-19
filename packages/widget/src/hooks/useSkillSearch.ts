import { useState } from 'react';
import { SearchSDK, type SkillSearchResult, type SearchOptions } from '@skillhub/search-sdk';

interface UseSkillSearchOptions {
  apiUrl?: string;
  pageSize?: number;
}

export function useSkillSearch(options: UseSkillSearchOptions = {}) {
  const { apiUrl = 'http://localhost:3000/api', pageSize = 20 } = options;
  
  const [sdk] = useState(() => new SearchSDK({ apiUrl }));
  const [results, setResults] = useState<SkillSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const search = async (searchOptions: SearchOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sdk.search({
        ...searchOptions,
        pageSize: searchOptions.pageSize || pageSize,
      });
      
      setResults(response.skills);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
      
      return response.skills;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '搜索失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const semanticSearch = async (query: string, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sdk.semanticSearch({ query, limit });
      setResults(response);
      setTotal(response.length);
      setPage(1);
      setTotalPages(1);
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '语义搜索失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setTotal(0);
    setPage(1);
    setTotalPages(0);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    total,
    page,
    totalPages,
    search,
    semanticSearch,
    clearResults,
  };
}

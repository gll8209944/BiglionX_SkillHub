import { QueryClient } from '@tanstack/react-query';

/**
 * 创建配置优化的 QueryClient 实例
 * 包含缓存策略、重试机制等最佳实践
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 默认 stale time 为 5 分钟
        staleTime: 5 * 60 * 1000,
        
        // 默认 gc time 为 10 分钟
        gcTime: 10 * 60 * 1000,
        
        // 失败时重试 2 次
        retry: 2,
        
        // 重试延迟(指数退避)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // 窗口聚焦时重新验证
        refetchOnWindowFocus: false,
        
        // 重新连接时重新验证
        refetchOnReconnect: true,
      },
      mutations: {
        // 突变失败时重试 1 次
        retry: 1,
        
        // 重试延迟
        retryDelay: 1000,
      },
    },
  });
}

/**
 * 常用的查询键工厂
 * 用于保持查询键的一致性
 */
export const queryKeys = {
  // Skills 相关
  skills: {
    all: ['skills'] as const,
    lists: () => [...queryKeys.skills.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.skills.lists(), filters] as const,
    details: () => [...queryKeys.skills.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.skills.details(), slug] as const,
  },
  
  // Namespaces 相关
  namespaces: {
    all: ['namespaces'] as const,
    lists: () => [...queryKeys.namespaces.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.namespaces.lists(), filters] as const,
    details: () => [...queryKeys.namespaces.all, 'detail'] as const,
    detail: (slug: string) => [...queryKeys.namespaces.details(), slug] as const,
    members: (slug: string) => [...queryKeys.namespaces.detail(slug), 'members'] as const,
  },
  
  // Reviews 相关
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.reviews.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.reviews.all, id] as const,
  },
  
  // Analytics 相关
  analytics: {
    all: ['analytics'] as const,
    overview: (period: string) => [...queryKeys.analytics.all, 'overview', period] as const,
  },
  
  // Audit Logs 相关
  auditLogs: {
    all: ['auditLogs'] as const,
    lists: () => [...queryKeys.auditLogs.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.auditLogs.lists(), filters] as const,
  },
  
  // Users 相关
  users: {
    all: ['users'] as const,
    profile: (userId: string) => [...queryKeys.users.all, userId] as const,
  },
};

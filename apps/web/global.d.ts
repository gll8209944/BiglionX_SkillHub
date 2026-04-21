/* eslint-disable no-unused-vars */
/**
 * 全局类型定义
 */

interface SearchHistoryAPI {
  addToHistory: (query: string) => void;
  clearHistory: () => void;
}

declare global {
  interface Window {
    __searchHistoryAPI?: SearchHistoryAPI;
  }
}

export {};

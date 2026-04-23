/* eslint-disable no-unused-vars */
/**
 * 全局类型定义
 */

// Tailwind CSS v4 类型声明
declare module 'tailwindcss' {
  const content: unknown;
  export default content;
}

// CSS 模块类型声明（支持 CSS Modules 和全局 CSS 导入）
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

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

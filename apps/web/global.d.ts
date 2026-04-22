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

// 显式声明 globals.css（用于副作用导入，不需要实际导入内容）
declare module './globals.css' {
  export {}
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

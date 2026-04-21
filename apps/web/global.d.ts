/* eslint-disable no-unused-vars */
/**
 * 全局类型定义
 */

// CSS 模块类型声明
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
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

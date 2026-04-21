/* eslint-disable no-unused-vars */
/**
 * 全局类型定义
 */

// CSS 文件和 CSS 模块类型声明
// 支持 side-effect import (import './globals.css') 和 CSS Modules (import styles from './file.module.css')
declare module '*.css';
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
declare module '*.scss';
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

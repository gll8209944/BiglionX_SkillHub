'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

interface SearchHistoryProps {
  maxItems?: number;
  className?: string;
}

const STORAGE_KEY = 'skillhub_search_history';

export default function SearchHistory({ 
  maxItems = 10, 
  className = '' 
}: SearchHistoryProps) {
  const router = useRouter();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 加载搜索历史
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  }, [maxItems]);

  // 添加搜索记录
  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    const trimmedQuery = query.trim();
    const newHistory = history.filter(item => item.query !== trimmedQuery);
    
    newHistory.unshift({
      query: trimmedQuery,
      timestamp: Date.now(),
    });

    const limitedHistory = newHistory.slice(0, maxItems);
    setHistory(limitedHistory);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  // 清除历史记录
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  // 删除单个记录
  const removeItem = (query: string) => {
    const newHistory = history.filter(item => item.query !== query);
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to update search history:', error);
    }
  };

  // 点击历史记录项
  const handleItemClick = (query: string) => {
    router.push(`/skills?q=${encodeURIComponent(query)}`);
    setShowHistory(false);
    addToHistory(query); // 更新timestamp
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };

  // 暴露方法给父组件
  useEffect(() => {
    window.__searchHistoryAPI = {
      addToHistory,
      clearHistory,
    };
  }, [history]);

  if (history.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {/* 历史文字链接 */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="text-sm text-blue-200 hover:text-white transition-colors cursor-pointer"
        title="搜索历史"
      >
        历史
      </button>

      {/* 历史列表 */}
      {showHistory && (
        <>
          {/* 遮罩层 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowHistory(false)}
          />
          
          {/* 下拉面板 */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">搜索历史</span>
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-red-600 transition-colors"
              >
                清空
              </button>
            </div>

            {/* 历史列表 */}
            <ul className="max-h-96 overflow-y-auto">
              {history.map((item, index) => (
                <li
                  key={index}
                  className="group flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                  onClick={() => handleItemClick(item.query)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-sm text-gray-900 truncate">{item.query}</span>
                    </div>
                    <span className="text-xs text-gray-400 ml-5.5">{formatTime(item.timestamp)}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item.query);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                    title="删除"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            {/* 底部提示 */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                最多保存 {maxItems} 条记录
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 工具函数：从任何地方添加搜索历史
export function addSearchHistory(query: string) {
  if (typeof window !== 'undefined' && window.__searchHistoryAPI) {
    window.__searchHistoryAPI.addToHistory(query);
  }
}

// 工具函数：清除搜索历史
export function clearSearchHistory() {
  if (typeof window !== 'undefined' && window.__searchHistoryAPI?.clearHistory) {
    window.__searchHistoryAPI.clearHistory();
  }
}

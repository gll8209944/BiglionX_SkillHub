'use client';

import { useEffect, useState } from 'react';

interface GlobalSearchLoadingIndicatorProps {
  isGlobalSearch: boolean;
  hasLocalResults: boolean;
  hasGlobalResults: boolean;
}

/**
 * 全局搜索加载指示器
 * 在全网搜索时显示加载状态
 */
export default function GlobalSearchLoadingIndicator({
  isGlobalSearch,
  hasLocalResults,
  hasGlobalResults,
}: GlobalSearchLoadingIndicatorProps) {
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    // 如果是全局搜索模式且还没有全网结果，显示加载状态
    if (isGlobalSearch && !hasGlobalResults) {
      setShowLoading(true);
      
      // 最多显示10秒，避免无限加载
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    } else {
      setShowLoading(false);
    }
  }, [isGlobalSearch, hasGlobalResults]);

  if (!showLoading) {
    return null;
  }

  return (
    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <div className="text-blue-700">
          <p className="font-medium">正在全网搜索...</p>
          <p className="text-sm text-blue-600 mt-1">
            {hasLocalResults 
              ? '已显示本站结果，正在搜索GitHub上的相关技能' 
              : '正在搜索GitHub上的相关技能'}
          </p>
        </div>
      </div>
    </div>
  );
}

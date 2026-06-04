'use client';

import { useState } from 'react';

export default function SkillsPageError({ reset }: { reset: () => void }) {
  const [waking, setWaking] = useState(false);

  const handleRetry = async () => {
    setWaking(true);

    // 调用健康检查端点唤醒数据库（会触发真实 DB 连接）
    try {
      await fetch('/api/health', { 
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      // 健康检查可能超时，但 DB 连接已被触发，Neon 正在唤醒
    }

    // 额外等待确保 Neon 完全就绪
    await new Promise(r => setTimeout(r, 3000));

    setWaking(false);
    reset();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* 数据库图标 */}
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>
        {!waking && <span className="absolute inset-0 rounded-full animate-ping bg-blue-200 opacity-50" />}
      </div>

      {/* 标题 */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {waking ? '正在唤醒数据库' : '数据库连接失败'}
      </h3>
      <p className="text-gray-500 mb-8 text-center max-w-sm">
        {waking
          ? '正在唤醒远程数据库，预计需要几秒钟...'
          : '数据库暂时无法连接，请确保数据库服务正常运行后重试'}
      </p>

      {/* 唤醒动画或重试按钮 */}
      {waking ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">数据库正在唤醒，请稍候...</p>
        </div>
      ) : (
        <>
          <button
            onClick={handleRetry}
            className="mt-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            重试
          </button>
          <p className="text-xs text-gray-400 mt-4">
            请确保数据库服务已启动
          </p>
        </>
      )}
    </div>
  );
}

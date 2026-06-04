'use client';

import { useState, useEffect, useRef } from 'react';

export default function DatabaseReconnecting() {
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const totalMs = 5000;
    const intervalMs = 50;
    const steps = totalMs / intervalMs;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        const elapsed = Math.floor((next / steps) * 5);
        setCountdown(Math.max(5 - elapsed, 0));
        if (next >= steps) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 100;
        }
        return (next / steps) * 100;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 进度到达 100% 后自动刷新页面
  useEffect(() => {
    if (progress >= 100 && !retrying) {
      setRetrying(true);
      setTimeout(() => {
        window.location.reload();
      }, 300);
    }
  }, [progress, retrying]);

  const handleRetry = () => {
    window.location.reload();
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
        {/* 脉冲动画 */}
        <span className="absolute inset-0 rounded-full animate-ping bg-blue-200 opacity-50" />
      </div>

      {/* 标题 */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        正在连接数据库
      </h3>
      <p className="text-gray-500 mb-8 text-center max-w-sm">
        {countdown > 0
          ? `数据库正在唤醒，预计 ${countdown} 秒完成...`
          : '即将连接成功，正在加载数据...'}
      </p>

      {/* 进度条 */}
      <div className="w-full max-w-xs mb-6">
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* 跑秒 */}
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-gray-400">连接中</span>
          <span className="text-xs font-medium text-blue-600 tabular-nums">
            {countdown > 0 ? `${countdown} 秒` : '重试中...'}
          </span>
          <span className="text-xs text-gray-400">即将完成</span>
        </div>
      </div>

      {/* 手动重试 */}
      {retrying && (
        <button
          onClick={handleRetry}
          className="mt-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
        >
          重试
        </button>
      )}

      {!retrying && (
        <p className="text-xs text-gray-400 mt-4">
          首次访问时数据库需要几秒唤醒，请稍候
        </p>
      )}
    </div>
  );
}

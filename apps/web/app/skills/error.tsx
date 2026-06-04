'use client';

export default function SkillsPageError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">数据库连接失败</h3>
      <p className="text-gray-500 mb-8 text-center max-w-sm">
        数据库正在唤醒中，请稍后重试
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
      >
        重试
      </button>
    </div>
  );
}

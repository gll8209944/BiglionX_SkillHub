'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  state_mismatch: '登录状态校验失败，请关闭无痕/隐私模式后重试，或清除本站 Cookie 再登录。',
  github_denied: '已取消 GitHub 授权。',
  github_callback_error: 'GitHub 登录处理失败，请稍后重试。',
  invalid_callback: 'OAuth 回调参数无效。',
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const errorMessage = error ? ERROR_MESSAGES[error] ?? `登录失败（${error}）` : null;

  const handleLogin = () => {
    window.location.href = '/auth/login';
  };

  const handleGitHubLogin = () => {
    window.location.href = '/auth/login?provider=github';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8 p-8 md:p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
        {/* Logo 和标题 */}
        <div className="text-center">
          <Link href="/" className="inline-block group">
            <div className="mx-auto h-60 w-60 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <img src="/skillhub.png" alt="Skill Hub Logo" className="w-full h-full object-contain" />
            </div>
          </Link>
          <h2 className="mt-2 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            欢迎使用 Skill Hub
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            AI Agent 技能注册中心
          </p>
          <Link
            href="/"
            className="inline-flex items-center mt-4 text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </Link>
        </div>

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* 登录按钮 */}
        <div className="mt-8 space-y-3">
          {/* ProClaw 登录按钮 */}
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-4 py-3.5 border border-transparent text-base font-semibold rounded-xl text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            使用 ProClaw 账号登录
          </button>

          {/* 分隔线 */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/80 text-gray-400">或</span>
            </div>
          </div>

          {/* GitHub 登录按钮 */}
          <button
            onClick={handleGitHubLogin}
            className="w-full flex items-center justify-center px-4 py-3.5 border border-gray-300 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            使用 GitHub 登录
          </button>
          <p className="mt-2 text-center text-sm text-gray-500">
            通过 GitHub 账号快速登录
          </p>
        </div>
      </div>
    </div>
  );
}

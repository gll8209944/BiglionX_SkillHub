'use client';

import Link from 'next/link';

export default function LoginPage() {
  const handleLogin = () => {
    window.location.href = '/auth/login';
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

        {/* 统一登录按钮 */}
        <div className="mt-8">
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center px-4 py-3.5 border border-transparent text-base font-semibold rounded-xl text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            使用 ProClaw 账号登录
          </button>
          <p className="mt-4 text-center text-sm text-gray-500">
            通过 ProClaw 统一账号系统登录，无需单独注册
          </p>
        </div>
      </div>
    </div>
  );
}

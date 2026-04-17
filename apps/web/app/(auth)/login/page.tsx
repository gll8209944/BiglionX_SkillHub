'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      await signIn('github', { 
        callbackUrl: '/dashboard' 
      });
    } catch (error) {
      console.error('GitHub 登录失败:', error);
      alert('GitHub 登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 暂时禁用邮箱登录（需要 Prisma Adapter 存储验证码）
  // const handleEmailLogin = async (e: React.FormEvent) => {
  //   ...
  // };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8 p-8 md:p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
        {/* Logo 和标题 */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg
              className="h-12 w-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            欢迎使用 Skill Hub
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            AI Agent 技能注册中心
          </p>
        </div>

        {/* GitHub 登录按钮 */}
        <div className="mt-8">
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-3.5 border border-transparent text-base font-semibold rounded-xl text-white bg-linear-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {isLoading ? '登录中...' : '使用 GitHub 登录'}
          </button>
        </div>

        {/* 分隔线 - 暂时隐藏 */}
        {/* <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">
                或者使用邮箱登录
              </span>
            </div>
          </div>
        </div> */}

        {/* 邮箱登录表单 - 暂时隐藏（需要 Prisma Adapter） */}
        {/* <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
          ...
        </form> */}

        {/* 功能列表 */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">
                安全、便捷的 OAuth 认证
              </span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-center text-sm font-medium text-gray-700 mb-4">
              登录后，您可以：
            </p>
            <div className="grid gap-3">
              {[
                { icon: '📦', title: '发布和管理 Skills', desc: '轻松上传和更新你的 AI 技能' },
                { icon: '🏷️', title: '创建命名空间', desc: '组织和管理你的技能集合' },
                { icon: '📊', title: '查看下载统计', desc: '实时追踪技能使用情况' },
                { icon: '✅', title: '参与审核流程', desc: '贡献社区，审核他人技能' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-linear-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

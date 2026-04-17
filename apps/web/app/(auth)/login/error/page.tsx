'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Verification':
        return '验证链接已过期或无效，请重新发送验证邮件';
      case 'EmailSignin':
        return '邮箱登录失败，请稍后重试';
      case 'Configuration':
        return '系统配置错误，请联系管理员';
      default:
        return '登录过程中发生错误，请重试';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8 p-8 md:p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
        {/* Logo 和标题 */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-linear-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            登录失败
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            发生了一些问题
          </p>
        </div>

        {/* 错误信息 */}
        <div className="mt-8 space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-900">
                  错误详情
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{getErrorMessage(error)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              返回登录页面
            </Link>
            
            <Link
              href="/"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

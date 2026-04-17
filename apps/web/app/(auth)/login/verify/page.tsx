'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            检查你的邮箱
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            我们已发送验证链接
          </p>
        </div>

        {/* 验证信息 */}
        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="shrink-0">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-blue-900">
                  验证邮件已发送
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  {email ? (
                    <p>
                      请检查 <strong>{email}</strong> 的收件箱，点击邮件中的链接完成登录。
                    </p>
                  ) : (
                    <p>请检查你的邮箱收件箱，点击邮件中的链接完成登录。</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-5 w-5 text-gray-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>链接有效期为 24 小时</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="h-5 w-5 text-gray-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>如果未收到，请检查垃圾邮件文件夹</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/login"
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              返回登录页面
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

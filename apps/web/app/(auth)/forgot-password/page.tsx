'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email || !email.includes('@')) {
      setError('请输入有效的邮箱地址');
      return;
    }

    try {
      setIsLoading(true);
      
      // TODO: 实现发送密码重置邮件的逻辑
      // 这里可以集成 Resend 或其他邮件服务
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '发送失败');
      }

      setSuccess(true);
    } catch (error) {
      console.error('发送重置邮件失败:', error);
      setError(error instanceof Error ? error.message : '发送失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8 p-8 md:p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
        {/* Logo 和标题 */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Skill Hub Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="mt-2 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            忘记密码
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            输入您的邮箱，我们将发送密码重置链接
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3.5 border border-transparent text-base font-semibold rounded-xl text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
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
                  发送中...
                </>
              ) : (
                '发送重置链接'
              )}
            </button>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ 如果该邮箱已注册，我们已发送密码重置链接。请检查您的邮箱（包括垃圾邮件文件夹）。
              </p>
            </div>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              className="w-full px-4 py-3.5 border border-gray-300 text-base font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              重新发送
            </button>
          </div>
        )}

        {/* 返回登录 */}
        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
          >
            ← 返回登录页面
          </Link>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">提示</h3>
              <p className="mt-1 text-xs text-blue-700">
                如果您还没有设置密码，请使用 GitHub 或邮箱验证码登录，然后在账户设置中设置密码。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('无效的重置链接');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return '密码长度至少为8个字符';
    }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(pwd)) {
      return '密码必须包含字母和数字';
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('无效的重置令牌');
      return;
    }

    // 验证密码
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          newPassword: password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '重置失败');
      }

      setSuccess(true);
      
      // 3秒后自动跳转到登录页
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      console.error('重置密码失败:', error);
      setError(error instanceof Error ? error.message : '重置失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full space-y-8 p-8 md:p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 flex items-center justify-center mb-4">
              <img src="/logo.png" alt="Skill Hub Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="mt-2 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              密码重置成功
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              您的密码已成功重置，即将跳转到登录页面...
            </p>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">
              ✓ 请使用新密码登录
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link 
              href="/login" 
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
            >
              立即登录 →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8 p-8 md:p-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
        {/* Logo 和标题 */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Skill Hub Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="mt-2 text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            重置密码
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            请输入您的新密码
          </p>
        </div>

        {!token ? (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 text-center">
              {error || '无效的重置链接'}
            </p>
            <div className="mt-4 text-center">
              <Link 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                重新获取重置链接
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                新密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少8位，包含字母和数字"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                密码必须至少8位，包含字母和数字
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                确认新密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入新密码"
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
                  重置中...
                </>
              ) : (
                '重置密码'
              )}
            </button>
          </form>
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
      </div>
    </div>
  );
}

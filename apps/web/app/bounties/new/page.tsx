'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export default function CreateBountyPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    tags: '',
    complexity: 'intermediate',
    reward: '',
    currency: 'CNY',
    deadline: '',
  });

  // 如果未登录，重定向到登录页
  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/bounties/new');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const requirements = {
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        complexity: formData.complexity,
      };

      const response = await fetch('/api/bounties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          requirements,
          reward: parseFloat(formData.reward),
          currency: formData.currency,
          deadline: formData.deadline || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/bounties/${data.data.id}`);
      } else {
        setError(data.error || '创建悬赏失败');
      }
    } catch (err) {
      console.error('Error creating bounty:', err);
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">发布技能悬赏</h1>
            <p className="mt-1 text-sm text-gray-600">
              描述您需要的技能，设置悬赏金额，等待开发者接单
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* 标题 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                悬赏标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                minLength={5}
                maxLength={200}
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="例如：创建一个PDF转Word的技能"
              />
            </div>

            {/* 详细描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                详细描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                minLength={20}
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="详细描述您需要的技能功能、使用场景、技术要求等..."
              />
            </div>

            {/* 分类 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  分类 <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">选择分类</option>
                  <option value="automation">自动化</option>
                  <option value="data-processing">数据处理</option>
                  <option value="ai-ml">AI/机器学习</option>
                  <option value="web-scraping">网页爬虫</option>
                  <option value="dev-tools">开发工具</option>
                  <option value="integration">系统集成</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label htmlFor="complexity" className="block text-sm font-medium text-gray-700">
                  复杂度
                </label>
                <select
                  id="complexity"
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                  <option value="expert">专家级</option>
                </select>
              </div>
            </div>

            {/* 标签 */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                标签（用逗号分隔）
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="例如：python, pdf, conversion"
              />
            </div>

            {/* 悬赏金额 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="reward" className="block text-sm font-medium text-gray-700">
                  悬赏金额 <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">¥</span>
                  </div>
                  <input
                    type="number"
                    id="reward"
                    name="reward"
                    required
                    min="1"
                    step="0.01"
                    value={formData.reward}
                    onChange={handleChange}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">CNY</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
                  截止时间（可选）
                </label>
                <input
                  type="datetime-local"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '发布中...' : '发布悬赏'}
              </button>
            </div>
          </form>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-blue-700">
                悬赏发布后，开发者可以查看并申请。您可以选择合适的开发者承接此任务。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

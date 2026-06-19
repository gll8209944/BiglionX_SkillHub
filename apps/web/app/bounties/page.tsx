'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/providers/SessionProvider';

export const dynamic = 'force-dynamic';

interface BountyRequirements {
  category?: string;
  subcategory?: string;
  tags?: string[];
  complexity?: string;
  [key: string]: unknown;
}

interface Bounty {
  id: string;
  title: string;
  description: string;
  requirements: BountyRequirements;
  reward: number;
  currency: string;
  status: string;
  deadline: string | null;
  createdAt: string;
  creator: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  _count: {
    applications: number;
    submissions: number;
  };
}

export default function BountiesPage() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchBounties();
  }, [page, statusFilter, categoryFilter]);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy: 'createdAt',
        order: 'desc',
      });

      if (statusFilter) {
        params.set('status', statusFilter);
      }

      if (categoryFilter) {
        params.set('category', categoryFilter);
      }

      const response = await fetch(`/api/bounties?${params}`);
      const data = await response.json();

      if (data.success) {
        setBounties(data.data.bounties);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch bounties:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatReward = (reward: number, currency: string) => {
    return `${currency === 'CNY' ? '¥' : '$'}${reward.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      OPEN: { label: '开放中', color: 'bg-green-100 text-green-800' },
      ASSIGNED: { label: '已分配', color: 'bg-blue-100 text-blue-800' },
      IN_PROGRESS: { label: '进行中', color: 'bg-yellow-100 text-yellow-800' },
      SUBMITTED: { label: '待审核', color: 'bg-purple-100 text-purple-800' },
      COMPLETED: { label: '已完成', color: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: '已取消', color: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 w-full px-6 py-2 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center group">
              <img src="/skillhub.png" alt="Skill Hub Logo" className="h-16 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              首页
            </Link>
            <Link
              href="/bounties"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              技能悬赏
            </Link>
            <Link
              href="https://github.com/BigLionX/SkillHub"
              target="_blank"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </Link>
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    控制台
                  </Link>
                  <div className="flex items-center space-x-2">
                    {session.user?.image && (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-700">
                      {session.user?.name || session.user?.email}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">技能悬赏</h1>
              <p className="mt-2 text-sm text-gray-600">
                发布技能需求，让专业开发者为您定制开发
              </p>
            </div>
            {session && (
              <Link
                href="/bounties/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                发布悬赏
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">全部</option>
                <option value="OPEN">开放中</option>
                <option value="ASSIGNED">已分配</option>
                <option value="IN_PROGRESS">进行中</option>
                <option value="COMPLETED">已完成</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">全部分类</option>
                <option value="automation">自动化</option>
                <option value="data-processing">数据处理</option>
                <option value="ai-ml">AI/机器学习</option>
                <option value="web-scraping">网页爬虫</option>
                <option value="dev-tools">开发工具</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bounty List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        ) : bounties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无悬赏</h3>
            <p className="mt-1 text-sm text-gray-500">成为第一个发布悬赏的人吧！</p>
            {session && (
              <div className="mt-6">
                <Link
                  href="/bounties/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  发布悬赏
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bounties.map((bounty) => (
              <Link
                key={bounty.id}
                href={`/bounties/${bounty.id}`}
                className="block bg-white shadow rounded-lg hover:shadow-lg transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    {getStatusBadge(bounty.status)}
                    <span className="text-lg font-bold text-indigo-600">
                      {formatReward(bounty.reward, bounty.currency)}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {bounty.title}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {bounty.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {bounty.creator.name || bounty.creator.email}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(bounty.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {bounty._count.applications} 申请
                    </div>
                    {bounty.deadline && (
                      <div className="text-sm text-gray-500">
                        截止: {formatDate(bounty.deadline)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                第 {page} / {totalPages} 页
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

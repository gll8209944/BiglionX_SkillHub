'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

interface BountyRequirements {
  category?: string;
  subcategory?: string;
  tags?: string[];
  complexity?: string;
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
  _count: {
    applications: number;
    submissions: number;
  };
}

export default function MyBountiesPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'created' | 'applied'>('created');

  // 获取我发布的悬赏
  const { data: createdBounties, isLoading: loadingCreated } = useQuery({
    queryKey: ['my-created-bounties'],
    queryFn: async () => {
      const response = await fetch('/api/bounties?creatorId=me', {
        credentials: 'include', // 携带 cookies
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('请先登录');
        throw new Error('Failed to fetch bounties');
      }
      const data = await response.json();
      return data.data.bounties as Bounty[];
    },
    enabled: activeTab === 'created' && !!session,
  });

  // 获取我申请的悬赏
  const { data: appliedBounties, isLoading: loadingApplied } = useQuery({
    queryKey: ['my-applied-bounties'],
    queryFn: async () => {
      const response = await fetch('/api/bounties?applicantId=me', {
        credentials: 'include', // 携带 cookies
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error('请先登录');
        throw new Error('Failed to fetch bounties');
      }
      const data = await response.json();
      return data.data.bounties as Bounty[];
    },
    enabled: activeTab === 'applied' && !!session,
  });

  const bounties = activeTab === 'created' ? createdBounties : appliedBounties;
  const isLoading = activeTab === 'created' ? loadingCreated : loadingApplied;

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

  if (!session) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">请先登录</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的悬赏</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理您发布和申请的技能悬赏
          </p>
        </div>
        <Link
          href="/bounties/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          发布新悬赏
        </Link>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('created')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'created'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            我发布的 ({createdBounties?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('applied')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applied'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            我申请的 ({appliedBounties?.length || 0})
          </button>
        </nav>
      </div>

      {/* 内容区域 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      ) : !bounties || bounties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {activeTab === 'created' ? '暂无发布的悬赏' : '暂无申请的悬赏'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'created' 
              ? '开始发布您的第一个悬赏吧！' 
              : '去浏览可用的悬赏并申请吧！'}
          </p>
          {activeTab === 'created' ? (
            <div className="mt-6">
              <Link
                href="/bounties/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                发布悬赏
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <Link
                href="/bounties"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                浏览悬赏
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

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(bounty.createdAt)}
                  </div>
                  {activeTab === 'created' && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {bounty._count.applications} 申请
                    </div>
                  )}
                </div>

                {bounty.deadline && (
                  <div className="mt-2 text-xs text-gray-500">
                    截止: {formatDate(bounty.deadline)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

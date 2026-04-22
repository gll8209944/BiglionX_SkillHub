'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, Download, DollarSign, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { StatCard, StatsGrid } from '@/components/ui/StatCard';
import { TimeRangeSelector, type TimeRange } from '@/components/ui/TimeRangeSelector';

interface PersonalStats {
  totalSkills: number;
  totalDownloads: number;
  averageRating: number;
  totalRevenue: number;
  activeUsers: number;
  skillsByStatus: Array<{ status: string; count: number }>;
  recentSkills: Array<{
    id: string;
    name: string;
    slug: string;
    status: string;
    downloadCount: number;
    rating: number;
    reviewCount: number;
    price: number;
    updatedAt: string;
  }>;
  downloadsTrend: Array<{ date: string; downloads: number }>;
  timeRange: string;
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');

  // 获取个人统计数据
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['personal-stats', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/personal?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('获取统计数据失败');
      }
      const result = await response.json();
      return result.data as PersonalStats;
    },
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
  });

  const stats = data || {
    totalSkills: 0,
    totalDownloads: 0,
    averageRating: 0,
    totalRevenue: 0,
    activeUsers: 0,
    skillsByStatus: [],
    recentSkills: [],
    downloadsTrend: [],
    timeRange: 'all',
  };

  // 计算平均评分的显示值
  const displayRating = stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0';

  return (
    <div className="space-y-8">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">欢迎回来! 👋</h1>
          <p className="mt-1 text-sm text-gray-500">
            这里是您的个人数据中心，查看和管理您的 Skills
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="刷新数据"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>加载数据失败，请重试</p>
        </div>
      )}

      {/* 统计卡片网格 */}
      <StatsGrid columns={4}>
        <StatCard
          title="我的 Skills"
          value={stats.totalSkills}
          icon={<Package className="w-6 h-6" />}
          color="blue"
          isLoading={isLoading}
          trend={{
            value: 12,
            label: '较上月',
            isPositive: true,
          }}
        />
        <StatCard
          title="总下载量"
          value={stats.totalDownloads.toLocaleString()}
          icon={<Download className="w-6 h-6" />}
          color="green"
          isLoading={isLoading}
          trend={{
            value: 8,
            label: '较上周',
            isPositive: true,
          }}
        />
        <StatCard
          title="平均评分"
          value={displayRating}
          icon={<span className="text-2xl">⭐</span>}
          color="orange"
          isLoading={isLoading}
        />
        <StatCard
          title="总收入"
          value={`¥${stats.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
          isLoading={isLoading}
          trend={{
            value: 15,
            label: '较上月',
            isPositive: true,
          }}
        />
      </StatsGrid>

      {/* Skills状态分布 */}
      {stats.skillsByStatus.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Skills 状态分布</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.skillsByStatus.map((item) => (
              <div key={item.status} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {item.status === 'APPROVED' && '已发布'}
                  {item.status === 'DRAFT' && '草稿'}
                  {item.status === 'PENDING_REVIEW' && '审核中'}
                  {item.status === 'UNDER_REVIEW' && '审核中'}
                  {item.status === 'REJECTED' && '已拒绝'}
                  {item.status === 'ARCHIVED' && '已归档'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快捷操作 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/skills/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Package className="w-4 h-4 mr-2" />
            发布新 Skill
          </Link>
          <Link
            href="/dashboard/skills"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            管理 Skills
          </Link>
          <Link
            href="/dashboard/namespaces"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            管理命名空间
          </Link>
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            查看详细分析
          </Link>
        </div>
      </div>

      {/* 最近的 Skills */}
      {stats.recentSkills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">最近更新的 Skills</h2>
            <Link
              href="/dashboard/skills"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentSkills.slice(0, 5).map((skill) => (
              <Link
                key={skill.id}
                href={`/dashboard/skills/${skill.slug}`}
                className="block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{skill.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {skill.downloadCount}
                      </span>
                      {skill.reviewCount > 0 && (
                        <span className="flex items-center gap-1">
                          ⭐ {skill.rating.toFixed(1)}
                        </span>
                      )}
                      <span>
                        {new Date(skill.updatedAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      skill.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : skill.status === 'DRAFT'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {skill.status === 'APPROVED' && '已发布'}
                    {skill.status === 'DRAFT' && '草稿'}
                    {skill.status === 'PENDING_REVIEW' && '审核中'}
                    {skill.status === 'UNDER_REVIEW' && '审核中'}
                    {skill.status === 'REJECTED' && '已拒绝'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

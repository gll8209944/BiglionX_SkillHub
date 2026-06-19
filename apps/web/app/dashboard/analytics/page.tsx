'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/components/providers/SessionProvider';
import Link from 'next/link';
import { TrendingUp, Download, Users, Star, Calendar } from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// 定义类型
interface CategoryItem {
  category: string;
  count: number;
}

interface SkillItem {
  id: string;
  name: string;
  createdAt: string | Date;
  downloadCount: number;
  status: string;
}

interface TopSkill {
  id: string;
  name: string;
  category: string;
  downloadCount: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function AnalyticsPage() {
  const { status } = useSession();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'platform' | 'personal'>('platform');

  // 获取平台分析数据
  const { data: platformData, isLoading: isLoadingPlatform } = useQuery({
    queryKey: ['analytics', 'platform', period],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/overview?period=${period}`);
      if (!response.ok) throw new Error('获取分析数据失败');
      return response.json();
    },
  });

  // 获取趋势数据
  const { data: trendsData } = useQuery({
    queryKey: ['analytics', 'trends', period],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/trends?period=${period}`);
      if (!response.ok) throw new Error('获取趋势数据失败');
      return response.json();
    },
  });

  // 获取个人数据（仅在已登录且切换到个人标签时请求）
  const { data: personalData } = useQuery({
    queryKey: ['analytics', 'personal'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/personal', {
        credentials: 'include', // 携带 cookies 进行身份验证
      });
      if (!response.ok) throw new Error('获取个人数据失败');
      return response.json();
    },
    enabled: activeTab === 'personal' && status === 'authenticated', // 仅在已登录且选中个人标签时启用
    retry: false, // 禁用自动重试
  });

  const trendData = trendsData?.data || [];
  
  // 使用真实 API 数据，如果没有数据则显示空数组
  const categoryData = platformData?.data?.skillsByCategory?.map((item: CategoryItem, index: number) => ({
    name: item.category,
    value: item.count,
    color: COLORS[index % COLORS.length],
  })) || [];

  // 如果未登录且切换到个人标签，显示登录提示
  if (status === 'unauthenticated') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
            <p className="mt-1 text-sm text-gray-600">查看平台和个人的详细统计数据</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('platform')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'platform'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              平台数据
            </button>
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'personal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              个人数据
            </button>
          </nav>
        </div>

        {activeTab === 'personal' ? (
          <div className="flex items-center justify-center min-h-100">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">请先登录</h2>
              <p className="text-gray-600 mb-4">登录后才能查看个人数据分析</p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                去登录
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-100">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>
    );
  }

  if (isLoadingPlatform) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 使用真实数据，如果没有则显示 0
  const stats = platformData?.data || {
    totalSkills: 0,
    totalDownloads: 0,
    totalUsers: 0,
    averageRating: 0,
    weeklyGrowth: 0,
    activeUsers: 0,
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据分析</h1>
          <p className="mt-1 text-sm text-gray-600">查看平台和个人的详细统计数据</p>
        </div>
        
        {/* 时间范围选择 */}
        <div className="flex items-center space-x-2 bg-white rounded-lg border p-1">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p === '7d' ? '最近7天' : p === '30d' ? '最近30天' : '最近90天'}
            </button>
          ))}
        </div>
      </div>

      {/* 选项卡 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('platform')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'platform'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            平台概览
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'personal'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            个人分析
          </button>
        </nav>
      </div>

      {activeTab === 'platform' ? (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总 Skills</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSkills}</p>
                  <p className="text-xs text-green-600 mt-1">
                    ↑ {stats.weeklyGrowth}% 本周增长
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总下载量</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalDownloads.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">总用户数</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.activeUsers} 活跃用户
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">平均评分</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageRating}</p>
                  <div className="flex items-center mt-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <Star className="w-3 h-3 text-yellow-400 fill-current opacity-50" />
                  </div>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills 增长趋势 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Skills 增长趋势</h3>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="skills" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-75 text-gray-500">
                  暂无数据
                </div>
              )}
            </div>

            {/* 下载量趋势 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">下载量趋势</h3>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="downloads" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-75 text-gray-500">
                  暂无数据
                </div>
              )}
            </div>

            {/* 分类分布 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Skills 分类分布</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry: { name: string; value: number; color: string }, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* 热门 Skills */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">热门 Skills Top 10</h3>
              {platformData?.data?.topSkills && platformData.data.topSkills.length > 0 ? (
                <div className="space-y-3">
                  {platformData.data.topSkills.slice(0, 10).map((skill: TopSkill) => (
                    <div key={skill.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                        <p className="text-xs text-gray-500">{skill.category}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(skill.downloadCount / platformData.data.topSkills[0].downloadCount) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">
                          {skill.downloadCount}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-500">
                  暂无数据
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* 个人分析 */
        <div className="space-y-6">
          {personalData?.data ? (
            <>
              {/* 个人统计卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <p className="text-sm font-medium text-gray-600">我的 Skills</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{personalData.data.totalSkills}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <p className="text-sm font-medium text-gray-600">总下载量</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{personalData.data.totalDownloads.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <p className="text-sm font-medium text-gray-600">平均评分</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{personalData.data.averageRating.toFixed(1)}</p>
                </div>
              </div>

              {/* 最近 Skills */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">最近的 Skills</h3>
                <div className="space-y-3">
                  {personalData.data.recentSkills.map((skill: SkillItem) => (
                    <div key={skill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium text-gray-900">{skill.name}</p>
                        <p className="text-xs text-gray-500">{new Date(skill.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{skill.downloadCount} 下载</p>
                        <p className="text-xs text-gray-500">{skill.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无个人数据</h3>
              <p className="text-sm text-gray-600">
                发布您的第一个 Skill 后，这里将显示您的个人统计数据。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Package, Download, Calendar, Grid, List, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { BatchActionBar } from '@/components/ui/BatchActionBar';
import { useToast } from '@/components/ui/Toast';

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  category: string;
  tags: string[];
  downloadCount: number;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  namespace: {
    id: string;
    slug: string;
    name: string;
  } | null;
  _count: {
    versions: number;
  };
  updatedAt: string;
}

type ViewMode = 'grid' | 'list';
type ActiveTab = 'all' | 'draft' | 'published' | 'archived';

export default function SkillsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const limit = 12;

  // 获取技能列表
  const { data, isLoading, error } = useQuery({
    queryKey: ['skills', page, search, activeTab],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        authorId: session?.user?.id || '',
      });
      
      if (search) {
        params.append('search', search);
      }

      // 根据标签页设置状态过滤
      if (activeTab === 'draft') {
        params.append('draft', 'true');
      } else if (activeTab === 'published') {
        params.append('status', 'APPROVED');
      } else if (activeTab === 'archived') {
        params.append('status', 'ARCHIVED');
      }

      const response = await fetch(`/api/skills?${params}`);
      if (!response.ok) {
        throw new Error('获取技能列表失败');
      }
      return response.json();
    },
    enabled: !!session?.user?.id,
  });

  // 批量操作mutation
  const batchMutation = useMutation({
    mutationFn: async ({ skillIds, action }: { skillIds: string[]; action: string }) => {
      const response = await fetch('/api/skills/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillIds, action }),
      });
      
      if (!response.ok) {
        throw new Error('批量操作失败');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.data.message);
      setSelectedSkills([]);
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : '操作失败');
    },
  });

  const skills: Skill[] = data?.data?.skills || [];
  const pagination = data?.data?.pagination || {};

  // 切换选择
  const toggleSelect = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedSkills.length === skills.length) {
      setSelectedSkills([]);
    } else {
      setSelectedSkills(skills.map(s => s.id));
    }
  };

  // 处理批量操作
  const handleBatchAction = async (action: 'publish' | 'archive' | 'draft' | 'delete') => {
    try {
      await batchMutation.mutateAsync({
        skillIds: selectedSkills,
        action,
      });
    } catch (error) {
      console.error('批量操作失败:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">加载失败，请刷新重试</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的Skills</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理您的AI Agent技能
          </p>
        </div>
        <Link
          href="/dashboard/skills/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          发布新 Skill
        </Link>
      </div>

      {/* 标签页 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'all', label: '全部' },
            { id: 'draft', label: '草稿箱' },
            { id: 'published', label: '已发布' },
            { id: 'archived', label: '已归档' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as ActiveTab);
                setPage(1);
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 搜索和工具栏 */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索 Skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* 视图切换 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="网格视图"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="列表视图"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Skills 网格/列表 */}
      {skills.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无 Skills</h3>
          <p className="mt-1 text-sm text-gray-500">
            开始创建你的第一个 Skill 吧！
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/skills/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              创建 Skill
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 全选按钮 */}
          <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg shadow-sm">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
            >
              {selectedSkills.length === skills.length ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5" />
              )}
              {selectedSkills.length === skills.length ? '取消全选' : '全选'}
            </button>
            <span className="text-sm text-gray-500">
              共 {pagination.total || 0} 个Skills
            </span>
          </div>

          {/* Skills展示 */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                {/* 复选框 */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex items-center' : ''}`}>
                  <button
                    onClick={() => toggleSelect(skill.id)}
                    className="mr-3"
                  >
                    {selectedSkills.includes(skill.id) ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  <Link href={`/dashboard/skills/${skill.slug}`} className="flex-1">
                    {/* 状态标签 */}
                    <div className="flex items-center justify-between mb-4">
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
                        {skill.status === 'ARCHIVED' && '已归档'}
                      </span>
                    </div>

                    {/* 标题 */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {skill.name}
                    </h3>

                    {/* 描述 */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {skill.description || '暂无描述'}
                    </p>

                    {/* 统计信息 */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          {skill.downloadCount}
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1" />
                          {skill._count.versions} 版本
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(skill.updatedAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                  disabled={page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  下一页
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    显示第{' '}
                    <span className="font-medium">
                      {(page - 1) * limit + 1}
                    </span>{' '}
                    到{' '}
                    <span className="font-medium">
                      {Math.min(page * limit, pagination.total)}
                    </span>{' '}
                    条，共{' '}
                    <span className="font-medium">{pagination.total}</span>{' '}
                    条结果
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      上一页
                    </button>
                    <button
                      onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                      disabled={page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      下一页
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 批量操作工具栏 */}
      <BatchActionBar
        selectedCount={selectedSkills.length}
        onAction={handleBatchAction}
        onCancel={() => setSelectedSkills([])}
        isLoading={batchMutation.isPending}
      />
    </div>
  );
}

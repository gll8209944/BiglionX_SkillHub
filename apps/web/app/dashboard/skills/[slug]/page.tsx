'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Download, GitBranch, Calendar, User, 
  Tag, Edit, Trash2, Package, CheckCircle, XCircle,
  Clock, AlertCircle
} from 'lucide-react';

interface SkillDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  repositoryUrl: string;
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
  versions: Array<{
    id: string;
    version: string;
    changelog: string;
    createdAt: string;
  }>;
  _count: {
    versions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function SkillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const slug = params.slug as string;

  // 获取技能详情
  const { data, isLoading, error } = useQuery({
    queryKey: ['skill', slug],
    queryFn: async () => {
      // 首先通过 slug 获取技能 ID
      const listResponse = await fetch(`/api/skills?search=${slug}&limit=100`);
      const listData = await listResponse.json();
      
      const skill = listData.data.skills.find((s: { slug: string; id: string }) => s.slug === slug);
      
      if (!skill) {
        throw new Error('技能不存在');
      }

      // 获取详细信息
      const response = await fetch(`/api/skills/${skill.id}`);
      if (!response.ok) {
        throw new Error('获取技能详情失败');
      }
      return response.json();
    },
  });

  // 删除技能
  const deleteMutation = useMutation({
    mutationFn: async (skillId: string) => {
      const response = await fetch(`/api/skills/${skillId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('删除失败');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      router.push('/dashboard/skills');
    },
    onError: (error) => {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    },
  });

  const skill: SkillDetail = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">加载失败</h3>
        <p className="mt-1 text-sm text-gray-500">{error?.message || '技能不存在'}</p>
        <div className="mt-6">
          <Link
            href="/dashboard/skills"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            返回列表
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'DRAFT':
        return <Clock className="h-5 w-5 text-gray-500" />;
      case 'PENDING_REVIEW':
      case 'UNDER_REVIEW':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'ARCHIVED':
        return <Archive className="h-5 w-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      APPROVED: '已批准',
      DRAFT: '草稿',
      PENDING_REVIEW: '待审核',
      UNDER_REVIEW: '审核中',
      REJECTED: '已拒绝',
      ARCHIVED: '已归档',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      APPROVED: 'bg-green-100 text-green-800',
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      ARCHIVED: 'bg-gray-100 text-gray-600',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Link
        href="/dashboard/skills"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        返回 Skills 列表
      </Link>

      {/* 标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{skill.name}</h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(skill.status)}`}>
              {getStatusIcon(skill.status)}
              {getStatusText(skill.status)}
            </span>
          </div>
          {skill.namespace && (
            <Link
              href={`/dashboard/namespaces/${skill.namespace.slug}`}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {skill.namespace.name}
            </Link>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/skills/${skill.slug}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Link>
          <button
            onClick={() => {
              if (confirm('确定要归档此技能吗？')) {
                deleteMutation.mutate(skill.id);
              }
            }}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {deleteMutation.isPending ? '删除中...' : '归档'}
          </button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：详细信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 描述 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">描述</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {skill.description || '暂无描述'}
            </p>
          </div>

          {/* 版本历史 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">版本历史</h2>
            {skill.versions && skill.versions.length > 0 ? (
              <div className="space-y-4">
                {skill.versions.map((version) => (
                  <div key={version.id} className="border-l-2 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-gray-900">{version.version}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{version.changelog || '无更新说明'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暂无版本记录</p>
            )}
          </div>
        </div>

        {/* 右侧：元信息 */}
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">统计信息</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Download className="h-5 w-5 mr-2" />
                  <span>下载量</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  {skill.downloadCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Package className="h-5 w-5 mr-2" />
                  <span>版本数</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">
                  {skill._count.versions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>创建时间</span>
                </div>
                <span className="text-sm text-gray-900">
                  {new Date(skill.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
            </div>
          </div>

          {/* 作者信息 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">作者</h2>
            <div className="flex items-center">
              {skill.author.image ? (
                <img
                  src={skill.author.image}
                  alt={skill.author.name || 'Author'}
                  className="h-12 w-12 rounded-full mr-3"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {skill.author.name || '匿名用户'}
                </p>
              </div>
            </div>
          </div>

          {/* 标签 */}
          {skill.tags && skill.tags.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">标签</h2>
              <div className="flex flex-wrap gap-2">
                {skill.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 仓库链接 */}
          {skill.repositoryUrl && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">代码仓库</h2>
              <a
                href={skill.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                查看仓库
              </a>
            </div>
          )}

          {/* 分类 */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">分类</h2>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700">
              {skill.category || '未分类'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Archive icon component
function Archive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

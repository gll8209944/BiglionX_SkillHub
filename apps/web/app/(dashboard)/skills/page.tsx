'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Search, Filter, Package, Download, Calendar } from 'lucide-react';
import { useState } from 'react';

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  category: string;
  tags: string[];
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
    downloads: number;
  };
  createdAt: string;
}

export default function SkillsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 12;

  // 获取技能列表
  const { data, isLoading, error } = useQuery({
    queryKey: ['skills', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/skills?${params}`);
      if (!response.ok) {
        throw new Error('获取技能列表失败');
      }
      return response.json();
    },
  });

  const skills: Skill[] = data?.data?.skills || [];
  const pagination = data?.data?.pagination || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
          <h1 className="text-3xl font-bold text-gray-900">Skills</h1>
          <p className="mt-1 text-sm text-gray-500">
            发现和管理 AI Agent 技能
          </p>
        </div>
        <Link
          href="/skills/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          发布新 Skill
        </Link>
      </div>

      {/* 搜索和过滤 */}
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter className="h-5 w-5 mr-2" />
            筛选
          </button>
        </div>
      </div>

      {/* Skills 网格 */}
      {skills.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无 Skills</h3>
          <p className="mt-1 text-sm text-gray-500">
            开始创建你的第一个 Skill 吧！
          </p>
          <div className="mt-6">
            <Link
              href="/skills/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              创建 Skill
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.slug}`}
              className="block group"
            >
              <div className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow duration-200">
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
                    {skill.status === 'APPROVED' && '已批准'}
                    {skill.status === 'DRAFT' && '草稿'}
                    {skill.status === 'PENDING_REVIEW' && '审核中'}
                    {skill.status === 'UNDER_REVIEW' && '审核中'}
                    {skill.status === 'REJECTED' && '已拒绝'}
                    {skill.status === 'ARCHIVED' && '已归档'}
                  </span>
                  {skill.namespace && (
                    <span className="text-xs text-gray-500">
                      {skill.namespace.name}
                    </span>
                  )}
                </div>

                {/* 标题 */}
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-2">
                  {skill.name}
                </h3>

                {/* 描述 */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {skill.description || '暂无描述'}
                </p>

                {/* 标签 */}
                {skill.tags && skill.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skill.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {tag}
                      </span>
                    ))}
                    {skill.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{skill.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* 作者信息 */}
                <div className="flex items-center mb-4">
                  {skill.author.image ? (
                    <img
                      src={skill.author.image}
                      alt={skill.author.name || 'Author'}
                      className="h-6 w-6 rounded-full mr-2"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-gray-300 mr-2"></div>
                  )}
                  <span className="text-sm text-gray-600">
                    {skill.author.name || '匿名用户'}
                  </span>
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {skill._count.downloads}
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {skill._count.versions} 版本
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(skill.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

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
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  上一页
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
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
    </div>
  );
}

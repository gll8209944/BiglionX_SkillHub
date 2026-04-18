import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Metadata } from 'next';
import { Prisma } from '@prisma/client';

// 定义类型
interface SkillWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string;
  downloadCount: number;
  rating: number;
  tags?: string[] | null;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  namespace?: {
    id: string;
    slug: string;
    name: string;
  } | null;
}

export const metadata: Metadata = {
  title: 'Skills 市场 - SkillHub',
  description: '浏览和发现优秀的 AI Agent 技能',
};

interface SearchParams {
  category?: string;
  search?: string;
  page?: string;
}

export default async function PublicSkillsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const category = searchParams.category;
  const search = searchParams.search;
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  // 构建查询条件
  const where: Prisma.SkillWhereInput = {
    status: 'APPROVED',
    isPublic: true,
  };

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
      { description: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
      { tags: { has: search } },
    ];
  }

  // 获取总数
  const total = await prisma.skill.count({ where });

  // 获取 skills
  const skills = await prisma.skill.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      downloadCount: 'desc',
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      namespace: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });

  // 分类列表
  const categories = [
    { value: '', label: '全部' },
    { value: 'ai-agent', label: 'AI Agent' },
    { value: 'data-science', label: '数据科学' },
    { value: 'web-development', label: 'Web 开发' },
    { value: 'automation', label: '自动化' },
    { value: 'productivity', label: '生产力' },
    { value: 'other', label: '其他' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      {/* 顶部导航 */}
      <nav className="sticky top-0 z-50 w-full px-6 py-4 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <img src="/logo.png" alt="Skill Hub Logo" className="h-10 w-10 object-contain" />
              <span className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Skill Hub
              </span>
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
              href="/skills"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              技能市场
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
              <Link
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-linear-to-r from-blue-600 via-indigo-700 to-purple-800 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDYwIEwgNjAgMCIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjIiIGZpbGw9Im5vbmUiIGZpbGwtb3BhY2l0eT0iMC4zIiBzdHJva2Utb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              发现优秀的 AI Agent 技能
            </div>
            <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
              Skills 市场
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              探索、下载和分享社区创建的优质技能，为你的 AI Agent 赋能无限可能
            </p>
            
            {/* Search Bar */}
            <form className="max-w-3xl mx-auto">
              <div className="relative flex items-center">
                <div className="absolute left-4 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="搜索技能名称、描述或标签..."
                  className="flex-1 pl-12 pr-32 py-4 rounded-2xl bg-white/95 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-8 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  搜索
                </button>
              </div>
            </form>
            
            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{total}</div>
                <div className="text-sm text-blue-100">可用技能</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{categories.length - 1}</div>
                <div className="text-sm text-blue-100">分类</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">∞</div>
                <div className="text-sm text-blue-100">可能性</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* 侧边栏 - 分类筛选 */}
          <aside className="w-64 shrink-0">
            <div className="bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-200/50 rounded-2xl p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">分类筛选</h3>
              </div>
              <nav className="space-y-1">
                {categories.map((cat) => (
                  <Link
                    key={cat.value}
                    href={cat.value ? `/?category=${cat.value}` : '/'}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      category === cat.value
                        ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:translate-x-1'
                    }`}
                  >
                    <span>{cat.label}</span>
                    {category === cat.value && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* 主内容区 */}
          <main className="flex-1">
            {/* 结果统计 */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  找到 <span className="font-bold text-blue-600">{total}</span> 个 Skills
                </p>
              </div>
              {skills.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>按</span>
                  <select className="border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>下载量</option>
                    <option>评分</option>
                    <option>最新</option>
                  </select>
                  <span>排序</span>
                </div>
              )}
            </div>

            {/* Skills 网格 */}
            {skills.length === 0 ? (
              <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50">
                <div className="w-20 h-20 mx-auto mb-6 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">未找到 Skills</h3>
                <p className="text-gray-600 mb-6">尝试调整搜索条件或浏览其他分类</p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  返回首页
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill: SkillWithRelations) => (
                  <Link
                    key={skill.id}
                    href={`/skills/${skill.slug}`}
                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all overflow-hidden border border-gray-100"
                  >
                    {/* Card Header with gradient accent */}
                    <div className="h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {skill.name}
                        </h3>
                        {skill.namespace && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border border-purple-200">
                            {skill.namespace.name}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                        {skill.description}
                      </p>

                      {/* Author and Stats */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center">
                          {skill.author?.image ? (
                            <img
                              src={skill.author.image}
                              alt={skill.author.name || ''}
                              className="w-8 h-8 rounded-full mr-2 ring-2 ring-white"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center mr-2 text-white text-xs font-bold">
                              {skill.author?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="text-sm text-gray-700 font-medium">{skill.author?.name || '未知作者'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            {skill.downloadCount.toLocaleString()}
                          </span>
                          <span className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            {skill.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* 标签 */}
                      {skill.tags && skill.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {skill.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-linear-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 hover:border-blue-300 transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* 分页 */}
            {total > limit && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  {page > 1 && (
                    <Link
                      href={`/?page=${page - 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      上一页
                    </Link>
                  )}
                  <span className="px-4 py-2 text-sm text-gray-700">
                    第 {page} 页 / 共 {Math.ceil(total / limit)} 页
                  </span>
                  {page < Math.ceil(total / limit) && (
                    <Link
                      href={`/?page=${page + 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      下一页
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-gray-900 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/logo.png" alt="Skill Hub Logo" className="h-10 w-10 object-contain" />
                <span className="text-2xl font-bold text-white">
                  Skill Hub
                </span>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                企业级开源 AI Agent 技能注册中心。发现、发布和管理高质量的 AI 技能，为你的项目赋能。
              </p>
              <div className="flex space-x-4 mt-6">
                <a
                  href="https://github.com/BigLionX/SkillHub"
                  target="_blank"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">快速链接</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    首页
                  </Link>
                </li>
                <li>
                  <Link href="/skills" className="hover:text-white transition-colors">
                    技能市场
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    登录
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    注册
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">资源</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://github.com/BigLionX/SkillHub"
                    target="_blank"
                    className="hover:text-white transition-colors"
                  >
                    GitHub
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/BigLionX/SkillHub/blob/main/README.md"
                    target="_blank"
                    className="hover:text-white transition-colors"
                  >
                    文档
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/BigLionX/SkillHub/issues"
                    target="_blank"
                    className="hover:text-white transition-colors"
                  >
                    反馈问题
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Skill Hub. 基于 Apache-2.0 许可证开源。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

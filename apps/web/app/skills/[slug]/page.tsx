import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const skill = await prisma.skill.findUnique({
    where: { slug },
  });

  if (!skill) {
    return {
      title: 'Skill 不存在',
    };
  }

  return {
    title: `${skill.name} - SkillHub`,
    description: skill.description,
  };
}

export default async function PublicSkillDetailPage({ params }: Props) {
  const { slug } = await params;

  const skill = await prisma.skill.findUnique({
    where: { slug },
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
      versions: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!skill) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/skills"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回 Skills 市场
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{skill.name}</h1>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                {skill.author && (
                  <div className="flex items-center">
                    {skill.author.image && (
                      <img
                        src={skill.author.image}
                        alt={skill.author.name || ''}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <span>{skill.author.name || '未知作者'}</span>
                  </div>
                )}
                {skill.namespace && (
                  <Link
                    href={`/namespaces/${skill.namespace.slug}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                  >
                    {skill.namespace.name}
                  </Link>
                )}
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {skill.downloadCount.toLocaleString()} 次下载
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {skill.rating.toFixed(1)} ({skill.reviewCount} 评价)
                </span>
              </div>
            </div>

            <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载安装
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主内容区 */}
          <main className="lg:col-span-2 space-y-6">
            {/* 描述 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">简介</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{skill.description}</p>
            </div>

            {/* README */}
            {skill.readme && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">README</h2>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: skill.readme }} />
              </div>
            )}

            {/* 版本历史 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">版本历史</h2>
              <div className="space-y-4">
                {skill.versions.map((version: { id: string; version: string; createdAt: Date; changelog?: string | null }) => (
                  <div key={version.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        v{version.version}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(version.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {version.changelog && (
                      <p className="text-sm text-gray-600">{version.changelog}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* 侧边栏 */}
          <aside className="space-y-6">
            {/* 分类和标签 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">分类</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                {skill.category}
              </span>

              {skill.tags && skill.tags.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-900 mt-6 mb-4">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {skill.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 统计信息 */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">统计信息</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">下载次数</dt>
                  <dd className="text-sm font-semibold text-gray-900">{skill.downloadCount.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">评分</dt>
                  <dd className="text-sm font-semibold text-gray-900">{skill.rating.toFixed(1)} / 5.0</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">评价数</dt>
                  <dd className="text-sm font-semibold text-gray-900">{skill.reviewCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">版本数</dt>
                  <dd className="text-sm font-semibold text-gray-900">{skill.versions.length}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">创建时间</dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {new Date(skill.createdAt).toLocaleDateString('zh-CN')}
                  </dd>
                </div>
              </dl>
            </div>

            {/* 相关链接 */}
            {skill.packageUrl && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">相关链接</h3>
                <a
                  href={skill.packageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  查看代码仓库
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

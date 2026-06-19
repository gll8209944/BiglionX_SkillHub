import { auth } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

// 强制动态渲染，避免在构建时访问数据库
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();

  // 获取统计数据
  const [
    totalSkills,
    pendingReviews,
    totalUsers,
    totalNamespaces,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.skill.count(),
    prisma.review.count({
      where: {
        status: {
          in: ['PENDING_REVIEW', 'UNDER_REVIEW'],
        },
      },
    }),
    prisma.user.count(),
    prisma.namespace.count(),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        actor: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理概览</h1>
        <p className="mt-1 text-sm text-gray-600">
          欢迎回来，{session?.user?.name || '管理员'}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* 总 Skills */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">总 Skills</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{totalSkills}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 待审核 */}
        <Link href="/admin/reviews" className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">待审核</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{pendingReviews}</dd>
                </dl>
              </div>
            </div>
          </div>
        </Link>

        {/* 总用户 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">总用户</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* 命名空间 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">命名空间</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{totalNamespaces}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">最近活动</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {recentAuditLogs.map((log: { id: string; action: string; resourceType: string; resourceId: string; createdAt: Date; actor?: { name?: string | null; email?: string | null } | null }, idx: number) => (
                <li key={log.id}>
                  <div className="relative pb-8">
                    {idx !== recentAuditLogs.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{log.actor?.name || '未知用户'}</span>
                            {' '}执行了{' '}
                            <span className="font-medium text-purple-600">{log.action}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {log.resourceType}: {log.resourceId}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={log.createdAt.toISOString()}>
                            {new Date(log.createdAt).toLocaleString('zh-CN')}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

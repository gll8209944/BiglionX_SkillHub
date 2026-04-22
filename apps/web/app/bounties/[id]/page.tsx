'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

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
  assignee?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  applications: Array<{
    id: string;
    proposal: string;
    estimatedTime: string | null;
    portfolio: string | null;
    status: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }>;
}

export default function BountyDetailPage() {
  const params = useParams();
  const sessionData = useSession();
  const session = sessionData?.data;
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    proposal: '',
    estimatedTime: '',
    portfolio: '',
  });

  const bountyId = params.id as string;

  useEffect(() => {
    fetchBounty();
  }, [bountyId]);

  const fetchBounty = async () => {
    try {
      const response = await fetch(`/api/bounties/${bountyId}`);
      const data = await response.json();
      
      if (data.success) {
        setBounty(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bounty:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);

    try {
      const response = await fetch(`/api/bounties/${bountyId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationForm),
      });

      const data = await response.json();

      if (data.success) {
        alert('申请提交成功！');
        setShowApplyModal(false);
        fetchBounty(); // 刷新数据
      } else {
        alert(data.error || '申请失败');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('网络错误，请重试');
    } finally {
      setApplying(false);
    }
  };

  const handleReviewApplication = async (applicationId: string, action: 'accept' | 'reject') => {
    if (!confirm(`确定要${action === 'accept' ? '接受' : '拒绝'}此申请吗？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bounties/${bountyId}/applications/${applicationId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchBounty();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('Error reviewing application:', error);
      alert('网络错误，请重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">悬赏不存在</h1>
          <Link href="/bounties" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800">
            返回悬赏列表
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = session?.user?.id === bounty.creator.id;
  const canApply = session && !isCreator && bounty.status === 'OPEN';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Link
            href="/bounties"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回悬赏列表
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主内容区 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 悬赏信息 */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{bounty.title}</h1>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span>发布者: {bounty.creator.name || bounty.creator.email}</span>
                    <span>发布于: {new Date(bounty.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    {bounty.currency === 'CNY' ? '¥' : '$'}{bounty.reward.toFixed(2)}
                  </div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bounty.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                      bounty.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bounty.status === 'OPEN' ? '开放中' :
                       bounty.status === 'ASSIGNED' ? '已分配' :
                       bounty.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold mb-3">详细描述</h2>
                <p className="whitespace-pre-wrap text-gray-700">{bounty.description}</p>
              </div>

              {bounty.requirements && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h2 className="text-xl font-semibold mb-3">技能要求</h2>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div><strong>分类:</strong> {bounty.requirements.category}</div>
                    {bounty.requirements.subcategory && (
                      <div><strong>子分类:</strong> {bounty.requirements.subcategory}</div>
                    )}
                    {bounty.requirements.tags && bounty.requirements.tags.length > 0 && (
                      <div>
                        <strong>标签:</strong>{' '}
                        {bounty.requirements.tags.map((tag: string, i: number) => (
                          <span key={i} className="inline-block bg-gray-100 px-2 py-1 rounded text-xs mr-2 mb-1">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {bounty.requirements.complexity && (
                      <div><strong>复杂度:</strong> {bounty.requirements.complexity}</div>
                    )}
                  </div>
                </div>
              )}

              {bounty.deadline && (
                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                  <strong>截止时间:</strong> {new Date(bounty.deadline).toLocaleString('zh-CN')}
                </div>
              )}
            </div>

            {/* 申请列表（仅创建者可见） */}
            {isCreator && bounty.applications && bounty.applications.length > 0 && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">申请列表 ({bounty.applications.length})</h2>
                <div className="space-y-4">
                  {bounty.applications.map((app) => (
                    <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          {app.user.image ? (
                            <img src={app.user.image} alt="" className="w-10 h-10 rounded-full mr-3" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold mr-3">
                              {app.user.name?.charAt(0) || app.user.email.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{app.user.name || app.user.email}</div>
                            <div className="text-sm text-gray-500">
                              申请时间: {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                            </div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {app.status === 'PENDING' ? '待审核' :
                           app.status === 'ACCEPTED' ? '已接受' : '已拒绝'}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">申请方案</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.proposal}</p>
                      </div>

                      {app.estimatedTime && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>预计完成时间:</strong> {app.estimatedTime}
                        </div>
                      )}

                      {app.status === 'PENDING' && bounty.status === 'OPEN' && (
                        <div className="flex space-x-2 mt-3">
                          <button
                            onClick={() => handleReviewApplication(app.id, 'accept')}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            接受
                          </button>
                          <button
                            onClick={() => handleReviewApplication(app.id, 'reject')}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            拒绝
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 操作按钮 */}
            <div className="bg-white shadow rounded-lg p-6">
              {canApply ? (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  申请此悬赏
                </button>
              ) : isCreator ? (
                <div className="text-center text-sm text-gray-600">
                  您是此悬赏的发布者
                </div>
              ) : !session ? (
                <Link
                  href={`/auth/signin?callbackUrl=/bounties/${bountyId}`}
                  className="block w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors text-center"
                >
                  登录后申请
                </Link>
              ) : (
                <div className="text-center text-sm text-gray-600">
                  {bounty.status !== 'OPEN' ? '此悬赏不再接受申请' : '您不能申请自己发布的悬赏'}
                </div>
              )}
            </div>

            {/* 承接者信息 */}
            {bounty.assignee && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">承接者</h3>
                <div className="flex items-center">
                  {bounty.assignee.image ? (
                    <img src={bounty.assignee.image} alt="" className="w-12 h-12 rounded-full mr-3" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold mr-3">
                      {bounty.assignee.name?.charAt(0) || bounty.assignee.email.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{bounty.assignee.name || bounty.assignee.email}</div>
                    <div className="text-sm text-gray-500">已承接此任务</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 申请弹窗 */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">申请悬赏</h2>
            </div>
            
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  申请方案 <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  minLength={50}
                  rows={6}
                  value={applicationForm.proposal}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, proposal: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="详细描述您的实现方案、技术选型、时间安排等..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  预计完成时间
                </label>
                <input
                  type="text"
                  value={applicationForm.estimatedTime}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例如：2周、1个月"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作品集/相关链接
                </label>
                <input
                  type="text"
                  value={applicationForm.portfolio}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, portfolio: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="您的GitHub、个人网站或相关项目链接"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {applying ? '提交中...' : '提交申请'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

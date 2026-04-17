'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Users, Plus, Trash2, Shield, UserPlus } from 'lucide-react';
import { Namespace, NamespaceMember } from '@/types';

export default function NamespaceMembersPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const namespaceSlug = params.slug as string;

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  // 获取命名空间详情
  const { data: namespaceData, isLoading: isLoadingNamespace } = useQuery({
    queryKey: ['namespace', namespaceSlug],
    queryFn: async () => {
      const response = await fetch(`/api/namespaces?slug=${namespaceSlug}`);
      if (!response.ok) throw new Error('获取命名空间失败');
      return response.json();
    },
  });

  // 获取成员列表
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['namespace-members', namespaceSlug],
    queryFn: async () => {
      const response = await fetch(`/api/namespaces/${namespaceSlug}/members`);
      if (!response.ok) throw new Error('获取成员列表失败');
      return response.json();
    },
  });

  const namespace: Namespace | null = namespaceData?.data?.namespaces?.[0] || null;
  const members: NamespaceMember[] = membersData?.data?.members || [];

  // 邀请成员
  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await fetch(`/api/namespaces/${namespaceSlug}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '邀请失败');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['namespace-members', namespaceSlug] });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('MEMBER');
    },
  });

  // 移除成员
  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/namespaces/${namespaceSlug}/members/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '移除失败');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['namespace-members', namespaceSlug] });
    },
  });

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const getRoleText = (role: string) => {
    const roleMap: Record<string, string> = {
      OWNER: '所有者',
      ADMIN: '管理员',
      MEMBER: '成员',
      VIEWER: '查看者',
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colorMap: Record<string, string> = {
      OWNER: 'bg-purple-100 text-purple-800',
      ADMIN: 'bg-red-100 text-red-800',
      MEMBER: 'bg-blue-100 text-blue-800',
      VIEWER: 'bg-gray-100 text-gray-800',
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800';
  };

  if (isLoadingNamespace || isLoadingMembers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!namespace) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">命名空间不存在</h3>
        <Link href="/dashboard/namespaces" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回命名空间列表
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 返回按钮 */}
      <Link
        href={`/dashboard/namespaces/${namespaceSlug}`}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        返回命名空间详情
      </Link>

      {/* 标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{namespace.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            管理命名空间成员和权限
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          邀请成员
        </button>
      </div>

      {/* 成员列表 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">成员列表</h2>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {members.length} 人
            </span>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无成员</h3>
            <p className="mt-1 text-sm text-gray-500">
              邀请团队成员加入这个命名空间
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                邀请成员
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {members.map((member) => (
              <li key={member.userId} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {member.userId.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.userId}
                      </p>
                      <p className="text-sm text-gray-500">
                        加入于 {new Date(member.joinedAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {getRoleText(member.role)}
                    </span>
                    {member.role !== 'OWNER' && (
                      <button
                        onClick={() => {
                          if (confirm('确定要移除此成员吗？')) {
                            removeMutation.mutate(member.userId);
                          }
                        }}
                        disabled={removeMutation.isPending}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 邀请成员模态框 */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">邀请成员</h3>
            </div>
            <form onSubmit={handleInviteSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="输入用户邮箱地址"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  角色
                </label>
                <select
                  id="role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="MEMBER">成员</option>
                  <option value="ADMIN">管理员</option>
                  <option value="VIEWER">查看者</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  所有者角色无法分配
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {inviteMutation.isPending ? '邀请中...' : '发送邀请'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

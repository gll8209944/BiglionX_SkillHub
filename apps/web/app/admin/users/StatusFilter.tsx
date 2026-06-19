'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent } from 'react';

interface StatusFilterProps {
  status: string;
  search?: string;
}

export default function StatusFilter({ status, search }: StatusFilterProps) {
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const params = new URLSearchParams(window.location.search);
    
    if (newStatus !== 'all') {
      params.set('status', newStatus);
    } else {
      params.delete('status');
    }
    
    // 保留搜索参数
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    
    router.push(`/admin/users?${params.toString()}`);
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
    >
      <option value="all">全部状态</option>
      <option value="verified">已验证</option>
      <option value="unverified">未验证</option>
    </select>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import type { SkillSearchResult } from '@skillhub/search-sdk';

interface SkillResultsProps {
  skills: SkillSearchResult[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function SkillResults({
  skills,
  loading = false,
  emptyMessage = '未找到相关技能',
}: SkillResultsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{emptyMessage}</h3>
        <p className="mt-1 text-sm text-gray-500">尝试使用不同的关键词搜索</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {skills.map((skill) => (
        <Link
          key={skill.id}
          href={`/skills/${skill.slug}`}
          className="group bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200"
        >
          <div className="p-6">
            {/* 标题 */}
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1">
              {skill.name}
            </h3>

            {/* 描述 */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
              {skill.description}
            </p>

            {/* 标签 */}
            {skill.tags && skill.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {skill.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {tag}
                  </span>
                ))}
                {skill.tags.length > 3 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{skill.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* 底部信息 */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                {/* Stars */}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{skill.starCount || 0}</span>
                </div>

                {/* Downloads */}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>{skill.downloadCount || 0}</span>
                </div>
              </div>

              {/* 分类 */}
              {skill.category && (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {skill.category}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

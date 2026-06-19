'use client';

import React, { useState } from 'react';
import SkillSearchBox from '@/components/ui/SkillSearchBox';
import SkillResults from '@/components/ui/SkillResults';
import type { SkillSearchResult } from '@skillhub/search-sdk';

/**
 * 搜索页面示例
 * 展示如何集成SkillHub搜索引擎SDK到Next.js应用
 */
export default function SearchPageExample() {
  const [skills, setSkills] = useState<SkillSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 搜索完成回调
  const handleSearchComplete = (results: SkillSearchResult[]) => {
    setSkills(results);
    setHasSearched(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 SkillHub 搜索引擎
          </h1>
          <p className="text-gray-600">
            强大的AI技能搜索，支持全文搜索和语义搜索
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索框 */}
        <div className="mb-8">
          <SkillSearchBox
            onSearchComplete={handleSearchComplete}
            placeholder="搜索AI技能，例如：python automation, data processing..."
            className="max-w-3xl"
          />
        </div>

        {/* 搜索结果 */}
        {hasSearched && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                搜索结果 ({skills.length})
              </h2>
              
              {/* 可以添加排序、过滤等选项 */}
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) => {
                    // TODO: 实现排序功能
                    console.log('Sort by:', e.target.value);
                  }}
                >
                  <option value="relevance">相关性</option>
                  <option value="stars">Stars</option>
                  <option value="downloads">下载量</option>
                  <option value="updated">更新时间</option>
                </select>
              </div>
            </div>

            <SkillResults
              skills={skills}
              loading={loading}
              emptyMessage="没有找到匹配的技能，试试其他关键词吧"
            />
          </div>
        )}

        {/* 初始状态 - 显示热门搜索或推荐 */}
        {!hasSearched && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              开始探索 AI 技能
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* 功能卡片1 */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">全文搜索</h3>
                <p className="text-sm text-gray-600">
                  通过关键词、分类、标签等多维度快速查找技能
                </p>
              </div>

              {/* 功能卡片2 */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">语义搜索</h3>
                <p className="text-sm text-gray-600">
                  理解您的查询意图，智能推荐相关技能
                </p>
              </div>

              {/* 功能卡片3 */}
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">实时建议</h3>
                <p className="text-sm text-gray-600">
                  输入时即时显示搜索建议和热门搜索词
                </p>
              </div>
            </div>

            {/* 使用提示 */}
            <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
              <h3 className="font-semibold text-blue-900 mb-3">💡 搜索技巧</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• 使用具体关键词，如 "python excel automation"</li>
                <li>• 尝试自然语言查询，如 "如何处理CSV文件"</li>
                <li>• 使用分类过滤缩小搜索范围</li>
                <li>• 查看搜索建议发现更多相关技能</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

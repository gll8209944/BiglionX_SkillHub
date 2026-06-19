'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface AdvancedFilterPanelProps {
  categories?: FilterOption[];
  subcategories?: FilterOption[];
  languages?: FilterOption[];
  sources?: FilterOption[];
  licenses?: FilterOption[];
  className?: string;
}

export default function AdvancedFilterPanel({
  categories = [],
  subcategories = [],
  languages = [],
  sources = [],
  licenses = [],
  className = '',
}: AdvancedFilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从URL获取当前筛选条件
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get('subcategory') || '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '');
  const [selectedSource, setSelectedSource] = useState(searchParams.get('source') || '');
  const [selectedLicense, setSelectedLicense] = useState(searchParams.get('license') || '');
  const [minQuality, setMinQuality] = useState(searchParams.get('minQuality') || '');
  const [minStars, setMinStars] = useState(searchParams.get('minStars') || '');
  const [maxStars, setMaxStars] = useState(searchParams.get('maxStars') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 应用筛选
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 保留搜索关键词
    const query = searchParams.get('q');
    if (query) {
      params.set('q', query);
    }

    // 设置筛选条件
    if (selectedCategory) {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }

    if (selectedSubcategory) {
      params.set('subcategory', selectedSubcategory);
    } else {
      params.delete('subcategory');
    }

    if (selectedLanguage) {
      params.set('language', selectedLanguage);
    } else {
      params.delete('language');
    }

    if (selectedSource) {
      params.set('source', selectedSource);
    } else {
      params.delete('source');
    }

    if (selectedLicense) {
      params.set('license', selectedLicense);
    } else {
      params.delete('license');
    }

    if (minQuality) {
      params.set('minQuality', minQuality);
    } else {
      params.delete('minQuality');
    }

    if (minStars) {
      params.set('minStars', minStars);
    } else {
      params.delete('minStars');
    }

    if (maxStars) {
      params.set('maxStars', maxStars);
    } else {
      params.delete('maxStars');
    }

    if (dateFrom) {
      params.set('dateFrom', dateFrom);
    } else {
      params.delete('dateFrom');
    }

    if (dateTo) {
      params.set('dateTo', dateTo);
    } else {
      params.delete('dateTo');
    }

    if (sortBy) {
      params.set('sortBy', sortBy);
    } else {
      params.delete('sortBy');
    }

    // 重置页码
    params.delete('page');

    router.push(`/skills?${params.toString()}`);
  };

  // 清除所有筛选
  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedLanguage('');
    setSelectedSource('');
    setSelectedLicense('');
    setMinQuality('');
    setMinStars('');
    setMaxStars('');
    setDateFrom('');
    setDateTo('');
    setSortBy('relevance');
    
    const params = new URLSearchParams();
    const query = searchParams.get('q');
    if (query) {
      params.set('q', query);
    }
    
    router.push(`/skills?${params.toString()}`);
  };

  // 检查是否有激活的筛选
  const hasActiveFilters = selectedCategory || selectedSubcategory || selectedLanguage || 
                          selectedSource || selectedLicense || minQuality || minStars || 
                          maxStars || dateFrom || dateTo || (sortBy && sortBy !== 'relevance');

  return (
    <div className={`bg-white/80 backdrop-blur-sm shadow-lg shadow-gray-200/50 rounded-2xl p-6 sticky top-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 text-lg">高级筛选</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            清除
          </button>
        )}
      </div>

      {/* 排序 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="relevance">相关性</option>
          <option value="quality">质量评分</option>
          <option value="updated">最近更新</option>
          <option value="stars">Stars 数量</option>
          <option value="downloads">下载次数</option>
        </select>
      </div>

      {/* 分类筛选 */}
      {categories.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">全部分类</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label} ({cat.count})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 高级筛选开关 */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mb-4"
      >
        <span>{showAdvanced ? '收起高级选项' : '展开高级选项'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 高级筛选选项 */}
      {showAdvanced && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          {/* 子分类 */}
          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">子分类</label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">全部子分类</option>
                {subcategories.map((subcat) => (
                  <option key={subcat.value} value={subcat.value}>
                    {subcat.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 语言 */}
          {languages.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">编程语言</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">全部语言</option>
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 数据源 */}
          {sources.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">数据源</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">全部来源</option>
                {sources.map((source) => (
                  <option key={source.value} value={source.value}>
                    {source.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 许可证类型 */}
          {licenses.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">许可证类型</label>
              <select
                value={selectedLicense}
                onChange={(e) => setSelectedLicense(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">全部许可证</option>
                {licenses.map((license) => (
                  <option key={license.value} value={license.value}>
                    {license.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stars 范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stars 范围</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">最小值</label>
                <input
                  type="number"
                  value={minStars}
                  onChange={(e) => setMinStars(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">最大值</label>
                <input
                  type="number"
                  value={maxStars}
                  onChange={(e) => setMaxStars(e.target.value)}
                  placeholder="不限"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 更新日期范围 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">更新日期范围</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">从</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">到</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* 最小质量评分 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              最低质量评分
            </label>
            <select
              value={minQuality}
              onChange={(e) => setMinQuality(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">不限</option>
              <option value="90">90分以上</option>
              <option value="80">80分以上</option>
              <option value="70">70分以上</option>
              <option value="60">60分以上</option>
            </select>
          </div>
        </div>
      )}

      {/* 应用按钮 */}
      <button
        onClick={applyFilters}
        className="w-full mt-6 px-4 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        应用筛选
      </button>

      {/* 活跃筛选标签 */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">当前筛选：</p>
          <div className="flex flex-wrap gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                {categories.find(c => c.value === selectedCategory)?.label || selectedCategory}
                <button
                  onClick={() => setSelectedCategory('')}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSubcategory && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
                {subcategories.find(s => s.value === selectedSubcategory)?.label || selectedSubcategory}
                <button
                  onClick={() => setSelectedSubcategory('')}
                  className="ml-1 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedLanguage && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-700">
                {languages.find(l => l.value === selectedLanguage)?.label || selectedLanguage}
                <button
                  onClick={() => setSelectedLanguage('')}
                  className="ml-1 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {minQuality && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-100 text-yellow-700">
                质量≥{minQuality}
                <button
                  onClick={() => setMinQuality('')}
                  className="ml-1 hover:text-yellow-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedLicense && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700">
                {licenses.find(l => l.value === selectedLicense)?.label || selectedLicense}
                <button
                  onClick={() => setSelectedLicense('')}
                  className="ml-1 hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            )}
            {(minStars || maxStars) && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-pink-100 text-pink-700">
                Stars: {minStars || '0'}-{maxStars || '∞'}
                <button
                  onClick={() => { setMinStars(''); setMaxStars(''); }}
                  className="ml-1 hover:text-pink-900"
                >
                  ×
                </button>
              </span>
            )}
            {(dateFrom || dateTo) && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-100 text-teal-700">
                {dateFrom || '开始'} 至 {dateTo || '现在'}
                <button
                  onClick={() => { setDateFrom(''); setDateTo(''); }}
                  className="ml-1 hover:text-teal-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

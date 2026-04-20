'use client';

import Link from 'next/link';

interface SkillCardProps {
  id: string;
  name: string;
  slug: string;
  description: string;
  category?: string;
  subcategory?: string | null;
  tags?: string[] | null;
  qualityScore?: number | null;
  starCount?: number;
  downloadCount?: number;
  author?: {
    name: string | null;
    image: string | null;
  } | null;
  namespace?: {
    name: string;
  } | null;
  updatedAt?: string;
}

// 子分类标签映射
const subcategoryLabels: Record<string, string> = {
  'ai_agent': 'AI代理',
  'llm_tools': 'LLM工具',
  'ml_framework': 'ML框架',
  'computer_vision': '计算机视觉',
  'speech_audio': '语音处理',
  'workflow_automation': '工作流自动化',
  'rpa_bot': 'RPA机器人',
  'task_scheduling': '任务调度',
  'database': '数据库',
  'data_viz': '数据可视化',
  'web_scraping': '网络爬虫',
  'mobile_app': '移动应用',
  'frontend': '前端开发',
  'ecommerce': '电商',
  'dev_tools': '开发工具',
  'testing': '测试工具',
  'documentation': '文档工具',
  'cli_tools': 'CLI工具',
};

function getSubcategoryLabel(subcategory: string): string {
  return subcategoryLabels[subcategory] || subcategory;
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// 获取质量分数颜色
function getQualityScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
}

export default function SkillCard({
  name,
  slug,
  description,
  subcategory,
  tags,
  qualityScore,
  starCount = 0,
  downloadCount = 0,
  author,
  namespace,
  updatedAt,
}: Omit<SkillCardProps, 'id' | 'category'>) {
  // 格式化更新时间
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return '今天';
    if (diffInDays === 1) return '昨天';
    if (diffInDays < 7) return `${diffInDays}天前`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}周前`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}个月前`;
    return `${Math.floor(diffInDays / 365)}年前`;
  };

  return (
    <Link
      href={`/skills/${slug}`}
      className="group block bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all overflow-hidden border border-gray-100"
    >
      {/* Card Header with gradient accent */}
      <div className="h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>
          {namespace && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-linear-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border border-purple-200">
              {namespace.name}
            </span>
          )}
        </div>
        
        {/* 子分类和质量分数徽章 */}
        {(subcategory || qualityScore) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {subcategory && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200">
                {getSubcategoryLabel(subcategory)}
              </span>
            )}
            {qualityScore && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${getQualityScoreColor(qualityScore)}`}>
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {Math.round(qualityScore)}%
              </span>
            )}
          </div>
        )}
        
        <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Author and Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center">
            {author?.image ? (
              <img
                src={author.image}
                alt={author.name || ''}
                className="w-8 h-8 rounded-full mr-2 ring-2 ring-white"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center mr-2 text-white text-xs font-bold">
                {author?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <span className="text-sm text-gray-700 font-medium">{author?.name || '未知作者'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center text-sm text-gray-600" title="下载次数">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {formatNumber(downloadCount)}
            </span>
            <span className="flex items-center text-sm text-gray-600" title="Stars">
              <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {formatNumber(starCount)}
            </span>
          </div>
        </div>

        {/* 标签 */}
        {tags && tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-linear-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 hover:border-blue-300 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 更新时间 */}
        {updatedAt && (
          <div className="mt-3 text-xs text-gray-500">
            更新于 {formatDate(updatedAt)}
          </div>
        )}
      </div>
    </Link>
  );
}

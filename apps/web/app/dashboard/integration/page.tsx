'use client';

import React from 'react';
import Link from 'next/link';
import { Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';

/**
 * SDK集成指南页面
 * 在用户的"我的空间"中提供完整的集成说明
 */
export default function IntegrationGuidePage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    install: 'npm install @skillhub/search-sdk',
    basicUsage: `import { SearchSDK } from '@skillhub/search-sdk';

const sdk = new SearchSDK({
  apiUrl: 'https://api.skillhub.com'
});

const results = await sdk.search({
  query: 'python automation',
  page: 1,
  pageSize: 20
});`,
    reactExample: `import { useState } from 'react';
import { searchSkills } from '@/lib/search-service';

export default function SkillSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const data = await searchSkills({ 
      query,
      page: 1,
      pageSize: 20
    });
    setResults(data.skills);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button onClick={handleSearch}>搜索</button>
      
      {results.map(skill => (
        <div key={skill.id}>
          <h3>{skill.name}</h3>
          <p>{skill.description}</p>
        </div>
      ))}
    </div>
  );
}`,
    semanticSearch: `// 语义搜索 - 理解查询意图
const results = await sdk.semanticSearch({
  query: '如何自动化处理Excel文件',
  limit: 10,
  minSimilarity: 0.5
});

results.forEach(result => {
  console.log(\`\${result.name} (相似度: \${(result.similarity * 100).toFixed(1)}%)\`);
});`,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SDK 集成指南</h1>
              <p className="text-sm text-gray-500">将 SkillHub 搜索引擎集成到您的应用中</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧导航 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="font-semibold text-gray-900 mb-4">快速导航</h2>
              <nav className="space-y-2">
                <a href="#quick-start" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  🚀 快速开始
                </a>
                <a href="#installation" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  📦 安装 SDK
                </a>
                <a href="#basic-usage" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  💻 基础用法
                </a>
                <a href="#react-integration" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  ⚛️ React 集成
                </a>
                <a href="#semantic-search" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  🧠 语义搜索
                </a>
                <a href="#api-reference" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  📚 API 参考
                </a>
                <a href="https://www.procalw.cc" target="_blank" rel="noopener noreferrer" className="block px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 hover:text-gray-900 transition-colors">
                  💡 示例项目
                </a>
              </nav>
            </div>
          </div>

          {/* 右侧内容 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 快速开始 */}
            <section id="quick-start" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 快速开始</h2>
              <p className="text-gray-600 mb-6">
                SkillHub Search SDK 是一个功能强大的搜索引擎插件，让您可以在几分钟内为您的应用添加智能搜索功能。
              </p>
              
              <div className="bg-linear-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-3">✨ 核心特性</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span><strong>全文搜索</strong> - 支持关键词、分类、标签等多维度搜索</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span><strong>语义搜索</strong> - 基于向量相似度的智能搜索，理解查询意图</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span><strong>类型安全</strong> - 完整的 TypeScript 类型定义</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span><strong>轻量级</strong> - 仅依赖 axios，包体积小</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* 安装 */}
            <section id="installation" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📦 安装 SDK</h2>
              
              <div className="relative">
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400 text-sm">{codeExamples.install}</code>
                </div>
                <button
                  onClick={() => copyToClipboard(codeExamples.install, 'install')}
                  className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  title="复制代码"
                >
                  {copiedCode === 'install' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p>或者使用 yarn：</p>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">yarn add @skillhub/search-sdk</code>
              </div>
            </section>

            {/* 基础用法 */}
            <section id="basic-usage" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">💻 基础用法</h2>
              
              <div className="relative">
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-gray-300 text-sm"><code>{codeExamples.basicUsage}</code></pre>
                </div>
                <button
                  onClick={() => copyToClipboard(codeExamples.basicUsage, 'basic')}
                  className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  title="复制代码"
                >
                  {copiedCode === 'basic' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </section>

            {/* React 集成 */}
            <section id="react-integration" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">⚛️ React 集成</h2>
              <p className="text-gray-600 mb-4">
                我们提供了现成的 React 组件，可以直接在您的项目中使用：
              </p>
              
              <div className="relative">
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-gray-300 text-sm"><code>{codeExamples.reactExample}</code></pre>
                </div>
                <button
                  onClick={() => copyToClipboard(codeExamples.reactExample, 'react')}
                  className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  title="复制代码"
                >
                  {copiedCode === 'react' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 提示：</strong>查看我们的{' '}
                  <Link href="/search-demo" className="underline hover:text-blue-900">
                    在线演示
                  </Link>
                  {' '}页面，了解完整的实现示例。
                </p>
              </div>
            </section>

            {/* 语义搜索 */}
            <section id="semantic-search" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🧠 语义搜索</h2>
              <p className="text-gray-600 mb-4">
                语义搜索可以理解用户的查询意图，而不仅仅是关键词匹配：
              </p>
              
              <div className="relative">
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-gray-300 text-sm"><code>{codeExamples.semanticSearch}</code></pre>
                </div>
                <button
                  onClick={() => copyToClipboard(codeExamples.semanticSearch, 'semantic')}
                  className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  title="复制代码"
                >
                  {copiedCode === 'semantic' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p><strong>示例：</strong></p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>查询："如何自动化处理Excel文件"</li>
                  <li>返回：相关的 Python、JavaScript 数据处理技能</li>
                  <li>即使没有完全匹配的关键词，也能找到相关结果</li>
                </ul>
              </div>
            </section>

            {/* API 参考 */}
            <section id="api-reference" className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📚 API 参考</h2>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">search(options)</h3>
                  <p className="text-sm text-gray-600 mb-2">执行全文搜索</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    query, category, language, page, pageSize, sortBy
                  </code>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">semanticSearch(options)</h3>
                  <p className="text-sm text-gray-600 mb-2">执行语义搜索</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    query, limit, minSimilarity, category, language
                  </code>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">getSuggestions(query, limit)</h3>
                  <p className="text-sm text-gray-600 mb-2">获取搜索建议</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    返回: Array&lt;{`{ text: string, type: string }`}&gt;
                  </code>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">getRelatedSkills(skillId, options)</h3>
                  <p className="text-sm text-gray-600 mb-2">获取相关技能</p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    limit, minSimilarity
                  </code>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

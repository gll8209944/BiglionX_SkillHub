'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/providers/SessionProvider';
import { SkillStoreWidget, SkillSearchWidget, MySkillsManager } from '@skillhub/widget';
import type { SkillSearchResult } from '@skillhub/search-sdk';

export default function WidgetDemoPage() {
  const { data: session } = useSession();
  const [activeDemo, setActiveDemo] = useState<'full' | 'search' | 'manager'>('full');
  const [lastSearchResults, setLastSearchResults] = useState<SkillSearchResult[]>([]);

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SkillHub Widget',
    description: '可嵌入的 AI Agent 技能商店组件，支持 Skill 搜索、管理和发布功能',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'AI 技能搜索引擎',
      '语义搜索功能',
      '本地 Skill 管理',
      '一键发布到 SkillHub',
      '主题定制',
      '响应式设计',
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full px-6 py-3 border-b border-gray-200 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center group">
              <img src="/skillhub.png" alt="Skill Hub Logo" className="h-12 w-auto object-contain transition-transform group-hover:scale-105" />
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
            >
              首页
            </Link>
            <Link
              href="/sdk"
              className="text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
            >
              SDK
            </Link>
            <Link
              href="/widget-demo"
              className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
            >
              Widget
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              {session ? '控制台' : '登录'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 SkillHub Widget 演示
          </h1>
          <p className="text-gray-600">
            体验可嵌入的 Skill 商店组件，为您的应用集成 Skill 搜索和管理功能
          </p>
        </div>
      </div>

      {/* Demo Selector - Tab Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            选择演示组件：
          </h2>
        </div>
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveDemo('full')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeDemo === 'full'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">🏪</span>
              完整 Skill 商店
              {activeDemo === 'full' && (
                <span className="ml-2 text-xs text-purple-500">（当前）</span>
              )}
            </button>
            <button
              onClick={() => setActiveDemo('search')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeDemo === 'search'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">🔍</span>
              仅搜索组件
              {activeDemo === 'search' && (
                <span className="ml-2 text-xs text-purple-500">（当前）</span>
              )}
            </button>
            <button
              onClick={() => setActiveDemo('manager')}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeDemo === 'manager'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className="mr-2">📦</span>
              Skills 管理器
              {activeDemo === 'manager' && (
                <span className="ml-2 text-xs text-purple-500">（当前）</span>
              )}
            </button>
          </nav>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeDemo === 'full' && (
            <div>
              <div className="mb-4 pb-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  完整 Skill 商店组件
                </h2>
                <p className="text-sm text-gray-600">
                  包含搜索和我的 Skills 管理功能，支持标签切换
                </p>
              </div>
              <SkillStoreWidget
                apiUrl={process.env.NEXT_PUBLIC_SKILLHUB_API_URL || 'http://localhost:3000/api'}
                defaultView="search"
                showTabs={true}
                theme={{
                  primaryColor: '#3b82f6',
                  borderRadius: '0.5rem',
                }}
                onSearchComplete={(results) => {
                  setLastSearchResults(results);
                  console.log('搜索完成:', results.length, '个结果');
                }}
                onSkillClick={(skill) => {
                  console.log('点击 Skill:', skill.name);
                }}
              />
            </div>
          )}

          {activeDemo === 'search' && (
            <div>
              <div className="mb-4 pb-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Skill 搜索组件
                </h2>
                <p className="text-sm text-gray-600">
                  轻量级搜索组件，支持高级筛选和语义搜索
                </p>
              </div>
              <SkillSearchWidget
                apiUrl={process.env.NEXT_PUBLIC_SKILLHUB_API_URL || 'http://localhost:3000/api'}
                placeholder="搜索 AI 技能..."
                showAdvancedFilter={true}
                showResults={true}
                theme={{
                  primaryColor: '#10b981',
                  borderRadius: '0.75rem',
                }}
                onSearchComplete={(results) => {
                  setLastSearchResults(results);
                  console.log('找到', results.length, '个结果');
                }}
                onSkillClick={(skill) => {
                  alert(`你点击了: ${skill.name}\n\n描述: ${skill.description}`);
                }}
              />
            </div>
          )}

          {activeDemo === 'manager' && (
            <div>
              <div className="mb-4 pb-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  我的 Skills 管理器
                </h2>
                <p className="text-sm text-gray-600">
                  管理本地 Skills，支持发布到 SkillHub
                </p>
              </div>
              <MySkillsManager
                apiUrl={process.env.NEXT_PUBLIC_SKILLHUB_API_URL || 'http://localhost:3000/api'}
                allowPublish={true}
                allowEdit={true}
                allowDelete={true}
                theme={{
                  primaryColor: '#8b5cf6',
                  borderRadius: '0.5rem',
                }}
                onSkillUpdate={() => {
                  console.log('Skill 已更新');
                }}
                onSkillPublish={(skillId) => {
                  console.log('Skill 已发布:', skillId);
                  alert('Skill 发布成功！');
                }}
              />
            </div>
          )}
        </div>

        {/* Search Results Info */}
        {lastSearchResults.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              最近搜索结果 ({lastSearchResults.length})
            </h3>
            <div className="space-y-2">
              {lastSearchResults.slice(0, 3).map((skill) => (
                <div key={skill.id} className="text-sm text-blue-800">
                  • {skill.name} - {skill.description.substring(0, 60)}...
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Code Example */}
        <div className="mt-6 bg-gray-900 rounded-lg p-6 overflow-x-auto">
          <h3 className="text-white font-semibold mb-3">💻 快速集成代码</h3>
          <pre className="text-sm text-gray-300">
            <code>{`import { SkillStoreWidget } from '@skillhub/widget';

function App() {
  return (
    <SkillStoreWidget
      apiUrl="https://api.skillhub.com"
      authToken="your-token"
      defaultView="search"
      theme={{
        primaryColor: '#3b82f6',
        borderRadius: '0.5rem'
      }}
    />
  );
}`}</code>
          </pre>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-900 mb-2">智能搜索</h3>
            <p className="text-sm text-gray-700">
              支持全文搜索、语义搜索、高级筛选，快速找到需要的 Skills
            </p>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="text-3xl mb-3">📦</div>
            <h3 className="font-semibold text-gray-900 mb-2">本地管理</h3>
            <p className="text-sm text-gray-700">
              在本地创建和管理 Skills，随时发布到 SkillHub 与社区分享
            </p>
          </div>

          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="font-semibold text-gray-900 mb-2">主题定制</h3>
            <p className="text-sm text-gray-700">
              灵活的主题配置，完美融入您的应用设计风格
            </p>
          </div>
        </div>

        {/* Use Cases - SEO Optimized */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              💼 SkillHub Widget 使用场景
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              无论您是开发者、企业还是教育机构，SkillHub Widget 都能为您提供强大的 AI Agent 技能管理能力
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Use Case 1 */}
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">💻</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">AI Agent 开发工具</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    在低代码/无代码平台中嵌入 Skill 搜索，让开发者快速发现和复用现有的 AI 技能组件，加速开发流程。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">低代码平台</span>
                    <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">组件市场</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Use Case 2 */}
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">企业内部知识库</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    企业部署私有 SkillHub 实例，员工管理和共享内部开发的 AI 技能，促进知识沉淀和团队协作。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-full">知识管理</span>
                    <span className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded-full">团队协作</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Use Case 3 */}
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">在线教育平台</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    集成到编程教育平台，学生学习 AI Agent 开发最佳实践，浏览和练习真实的 Skill 案例。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-full">在线教育</span>
                    <span className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-full">实践教学</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Use Case 4 */}
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">SaaS 产品扩展</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    SaaS 产品集成 Skill 管理功能，为用户提供插件式扩展能力，构建开放的生态系统。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded-full">SaaS</span>
                    <span className="px-2 py-1 text-xs bg-orange-50 text-orange-700 rounded-full">插件系统</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Use Case 5 */}
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">聊天机器人平台</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    为聊天机器人开发者提供 Skill  marketplace，快速集成对话能力、数据处理和业务逻辑。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-full">Chatbot</span>
                    <span className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded-full">对话系统</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Use Case 6 */}
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">数据分析工作台</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    数据分析师使用 Skill 搜索找到数据处理、可视化和机器学习技能，提升工作效率。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full">数据分析</span>
                    <span className="px-2 py-1 text-xs bg-indigo-50 text-indigo-700 rounded-full">BI工具</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Use Case 7 */}
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">开源社区门户</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    开源项目集成 Skill 商店，展示社区贡献的 AI 技能，吸引开发者参与和贡献。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded-full">开源社区</span>
                    <span className="px-2 py-1 text-xs bg-teal-50 text-teal-700 rounded-full">开发者生态</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Use Case 8 */}
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">自动化工作流平台</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    在 Zapier、Make 等自动化平台中集成，用户搜索和组合 AI 技能构建复杂工作流。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-pink-50 text-pink-700 rounded-full">自动化</span>
                    <span className="px-2 py-1 text-xs bg-pink-50 text-pink-700 rounded-full">工作流</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Use Case 9 */}
            <article className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎮</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">游戏开发引擎</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    游戏引擎集成 AI 技能市场，开发者快速获取 NPC 行为、内容生成等 AI 能力。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-full">游戏开发</span>
                    <span className="px-2 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-full">AI NPC</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* SEO Keywords Section */}
        <div className="mt-12 bg-linear-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            🔑 为什么选择 SkillHub Widget？
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">嵌入式组件</div>
              <div className="text-gray-600">React/Vue/Angular</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">AI 技能管理</div>
              <div className="text-gray-600">Agent Skills</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">语义搜索</div>
              <div className="text-gray-600">Vector Search</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">元数据管理</div>
              <div className="text-gray-600">Skill Metadata</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">低代码集成</div>
              <div className="text-gray-600">No-Code Platform</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">企业级方案</div>
              <div className="text-gray-600">Enterprise Ready</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">开源免费</div>
              <div className="text-gray-600">Open Source</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900 mb-1">TypeScript</div>
              <div className="text-gray-600">类型安全</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

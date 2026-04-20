'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CrawlerStats {
  totalTasks: number;
  pendingTasks: number;
  processingTasks: number;
  completedTasks: number;
  failedTasks: number;
}

interface RecentTask {
  id: string;
  taskType: string;
  target: string;
  status: string;
  createdAt: Date;
  completedAt?: Date | null;
}

interface DataSource {
  id: string;
  name: string;
  enabled: boolean;
  type: 'github' | 'skillsmp' | 'gitlab' | 'custom';
  description: string;
}

interface CrawlerSettingsClientProps {
  stats: CrawlerStats;
  recentTasks: RecentTask[];
}

export default function CrawlerSettingsClient({ stats, recentTasks }: CrawlerSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sources' | 'config' | 'tasks'>('overview');
  const [isFullSyncModalOpen, setIsFullSyncModalOpen] = useState(false);
  const [isStartCrawlModalOpen, setIsStartCrawlModalOpen] = useState(false);
  
  // 添加自定义仓库
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [customRepos, setCustomRepos] = useState<string[]>([]);
  
  // 添加搜索查询
  const [newSearchQuery, setNewSearchQuery] = useState('');
  
  // 数据源配置
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { id: 'github', name: 'GitHub', enabled: true, type: 'github', description: '从 GitHub 搜索和爬取 AI Agent Skills' },
    { id: 'skillsmp', name: 'SkillsMP', enabled: false, type: 'skillsmp', description: '从 SkillsMP API 获取 trending skills' },
    { id: 'gitlab', name: 'GitLab', enabled: false, type: 'gitlab', description: '从 GitLab 仓库爬取 Skills' },
    { id: 'custom', name: '自定义仓库', enabled: false, type: 'custom', description: '手动添加特定的仓库 URL' },
  ]);

  // 爬虫配置
  const [config, setConfig] = useState({
    isSpecializedSearch: false,
    batchSize: 20,
    concurrentLimit: 5,
    qualityThreshold: 60,
    scheduleEnabled: false,
    cronExpression: '0 3 * * *',
    timezone: 'Asia/Shanghai',
    searchQueries: ['skill.md', 'agent skill', 'ai tool', 'llm framework'],
    minStars: 30,
    maxResults: 50,
    languages: ['TypeScript', 'JavaScript', 'Python'],
    requireSkillMd: true,
    excludeArchived: true,
  });

  const handleToggleDataSource = (id: string) => {
    setDataSources(sources =>
      sources.map(source =>
        source.id === id ? { ...source, enabled: !source.enabled } : source
      )
    );
  };

  // 添加自定义仓库
  const handleAddCustomRepo = () => {
    if (newRepoUrl.trim() && !customRepos.includes(newRepoUrl.trim())) {
      setCustomRepos([...customRepos, newRepoUrl.trim()]);
      setNewRepoUrl('');
    }
  };

  // 删除自定义仓库
  const handleRemoveCustomRepo = (repoUrl: string) => {
    setCustomRepos(customRepos.filter(url => url !== repoUrl));
  };

  // 添加搜索查询
  const handleAddSearchQuery = () => {
    if (newSearchQuery.trim() && !config.searchQueries.includes(newSearchQuery.trim())) {
      setConfig({
        ...config,
        searchQueries: [...config.searchQueries, newSearchQuery.trim()],
      });
      setNewSearchQuery('');
    }
  };

  // 删除搜索查询
  const handleRemoveSearchQuery = (query: string) => {
    setConfig({
      ...config,
      searchQueries: config.searchQueries.filter(q => q !== query),
    });
  };

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/admin/crawler/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            dataSources: {
              github: {
                enabled: dataSources.find(ds => ds.id === 'github')?.enabled || false,
                searchQueries: config.searchQueries,
                minStars: config.minStars,
                maxResults: config.maxResults,
              },
              skillsmp: {
                enabled: dataSources.find(ds => ds.id === 'skillsmp')?.enabled || false,
                baseUrl: 'https://api.skillsmp.com',
              },
              gitlab: {
                enabled: dataSources.find(ds => ds.id === 'gitlab')?.enabled || false,
                baseUrl: 'https://gitlab.com',
              },
              custom: {
                enabled: dataSources.find(ds => ds.id === 'custom')?.enabled || false,
                repositories: customRepos,
              },
            },
            strategy: {
              isSpecializedSearch: config.isSpecializedSearch,
              batchSize: config.batchSize,
              concurrentLimit: config.concurrentLimit,
              qualityThreshold: config.qualityThreshold,
              languages: config.languages,
              categories: [],
            },
            schedule: {
              enabled: config.scheduleEnabled,
              cronExpression: config.cronExpression,
              timezone: config.timezone,
            },
            filters: {
              excludeArchived: config.excludeArchived,
              minLastUpdate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
              requireSkillMd: config.requireSkillMd,
              minDescriptionLength: 50,
            },
          },
        }),
      });

      if (response.ok) {
        alert('✅ 配置已保存成功！');
      } else {
        alert('❌ 保存失败，请重试');
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      alert('❌ 保存失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleStartCrawl = async () => {
    try {
      const response = await fetch('/api/admin/crawler/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'immediate',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ 爬虫已启动！\n\n${JSON.stringify(data.result, null, 2)}`);
        setIsStartCrawlModalOpen(false);
      } else {
        alert(`❌ 启动失败：${data.error}`);
      }
    } catch (error) {
      console.error('Failed to start crawler:', error);
      alert('❌ 启动失败：' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">爬虫设置</h1>
        <p className="mt-1 text-sm text-gray-600">
          管理 Skill 数据采集和同步任务
        </p>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview' as const, label: '概览' },
            { id: 'sources' as const, label: '数据源' },
            { id: 'config' as const, label: '采集配置' },
            { id: 'tasks' as const, label: '任务历史' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 概览标签页 */}
      {activeTab === 'overview' && (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">总任务数</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stats.totalTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
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
                      <dt className="text-sm font-medium text-gray-500 truncate">待处理</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stats.pendingTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">处理中</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stats.processingTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">失败任务</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stats.failedTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-linear-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">快速操作</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setIsStartCrawlModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-colors cursor-pointer text-left"
              >
                <div className="font-medium">立即启动爬虫</div>
                <div className="text-sm text-white/80 mt-1">根据配置开始采集</div>
              </button>
              <button
                onClick={() => setIsFullSyncModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-colors cursor-pointer text-left"
              >
                <div className="font-medium">执行全量同步</div>
                <div className="text-sm text-white/80 mt-1">从种子仓库全面采集</div>
              </button>
              <Link
                href="/admin/crawler/tasks"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 transition-colors"
              >
                <div className="font-medium">查看任务历史</div>
                <div className="text-sm text-white/80 mt-1">查看所有爬虫任务记录</div>
              </Link>
            </div>
          </div>

          {/* 最近任务 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">最近任务</h3>
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentTasks.map((task, idx) => (
                    <li key={task.id}>
                      <div className="relative pb-8">
                        {idx !== recentTasks.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              task.status === 'completed' ? 'bg-green-100' :
                              task.status === 'failed' ? 'bg-red-100' :
                              task.status === 'processing' ? 'bg-purple-100' :
                              'bg-yellow-100'
                            }`}>
                              <svg className={`h-5 w-5 ${
                                task.status === 'completed' ? 'text-green-600' :
                                task.status === 'failed' ? 'text-red-600' :
                                task.status === 'processing' ? 'text-purple-600' :
                                'text-yellow-600'
                              }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                <span className="font-medium">{task.taskType.replace('_', ' ')}</span>
                                {' '}
                                <span className="text-gray-500">- {task.target.substring(0, 50)}{task.target.length > 50 ? '...' : ''}</span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                状态: 
                                <span className={`ml-1 font-medium ${
                                  task.status === 'completed' ? 'text-green-600' :
                                  task.status === 'failed' ? 'text-red-600' :
                                  task.status === 'processing' ? 'text-purple-600' :
                                  'text-yellow-600'
                                }`}>
                                  {task.status === 'completed' ? '完成' :
                                   task.status === 'failed' ? '失败' :
                                   task.status === 'processing' ? '处理中' :
                                   '等待中'}
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={task.createdAt.toISOString()}>
                                {new Date(task.createdAt).toLocaleString('zh-CN')}
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
        </>
      )}

      {/* 数据源标签页 */}
      {activeTab === 'sources' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">数据源配置</h3>
            <p className="text-sm text-gray-600 mb-6">
              选择要从中采集 Skill 数据的数据源。可以启用多个数据源同时采集。
            </p>
            
            <div className="space-y-4">
              {dataSources.map(source => (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-900">{source.name}</h4>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        source.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {source.enabled ? '已启用' : '已禁用'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{source.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleDataSource(source.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      source.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        source.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* 自定义仓库管理 */}
            <div className="mt-8 border-t pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">自定义仓库</h4>
              <p className="text-sm text-gray-600 mb-4">添加特定的 GitHub 仓库 URL 进行爬取</p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  placeholder="例如: https://github.com/owner/repo"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomRepo()}
                />
                <button
                  onClick={handleAddCustomRepo}
                  disabled={!newRepoUrl.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加
                </button>
              </div>

              {customRepos.length > 0 && (
                <ul className="space-y-2">
                  {customRepos.map((repo, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700 truncate flex-1">{repo}</span>
                      <button
                        onClick={() => handleRemoveCustomRepo(repo)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* GitHub 搜索查询管理 */}
            <div className="mt-8 border-t pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">GitHub 搜索查询</h4>
              <p className="text-sm text-gray-600 mb-4">配置用于搜索 AI Agent Skills 的关键词</p>
              
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSearchQuery}
                  onChange={(e) => setNewSearchQuery(e.target.value)}
                  placeholder="例如: skill.md, agent skill, ai tool"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSearchQuery()}
                />
                <button
                  onClick={handleAddSearchQuery}
                  disabled={!newSearchQuery.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  添加
                </button>
              </div>

              {config.searchQueries.length > 0 && (
                <ul className="space-y-2">
                  {config.searchQueries.map((query, index) => (
                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{query}</span>
                      <button
                        onClick={() => handleRemoveSearchQuery(query)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 采集配置标签页 */}
      {activeTab === 'config' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">采集配置</h3>
            
            <div className="space-y-6">
              {/* 搜索策略 */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">搜索策略</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.isSpecializedSearch}
                      onChange={(e) => setConfig({ ...config, isSpecializedSearch: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用专项搜索模式（针对特定领域深度采集）</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.requireSkillMd}
                      onChange={(e) => setConfig({ ...config, requireSkillMd: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">仅采集包含 SKILL.md 文件的仓库</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.excludeArchived}
                      onChange={(e) => setConfig({ ...config, excludeArchived: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">排除已归档的仓库</span>
                  </label>
                </div>
              </div>

              {/* 采集参数 */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">采集参数</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">每次采集数量</label>
                    <input
                      type="number"
                      value={config.batchSize}
                      onChange={(e) => setConfig({ ...config, batchSize: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="1"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">并发限制</label>
                    <input
                      type="number"
                      value={config.concurrentLimit}
                      onChange={(e) => setConfig({ ...config, concurrentLimit: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="1"
                      max="20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最小 Stars 数</label>
                    <input
                      type="number"
                      value={config.minStars}
                      onChange={(e) => setConfig({ ...config, minStars: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">质量阈值 (0-100)</label>
                    <input
                      type="number"
                      value={config.qualityThreshold}
                      onChange={(e) => setConfig({ ...config, qualityThreshold: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* 搜索查询 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900">GitHub 搜索查询</h4>
                  <button
                    onClick={handleAddSearchQuery}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    + 添加查询
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.searchQueries.map((query, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {query}
                      <button
                        onClick={() => handleRemoveSearchQuery(query)}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* 定时任务 */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">定时任务</h4>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.scheduleEnabled}
                      onChange={(e) => setConfig({ ...config, scheduleEnabled: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">启用定时自动采集</span>
                  </label>
                  {config.scheduleEnabled && (
                    <div className="ml-6 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cron 表达式</label>
                        <input
                          type="text"
                          value={config.cronExpression}
                          onChange={(e) => setConfig({ ...config, cronExpression: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0 3 * * *"
                        />
                        <p className="text-xs text-gray-500 mt-1">当前: 每天凌晨 3 点执行</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setConfig({
                  isSpecializedSearch: false,
                  batchSize: 20,
                  concurrentLimit: 5,
                  qualityThreshold: 60,
                  scheduleEnabled: false,
                  cronExpression: '0 3 * * *',
                  timezone: 'Asia/Shanghai',
                  searchQueries: ['skill.md', 'agent skill', 'ai tool', 'llm framework'],
                  minStars: 30,
                  maxResults: 50,
                  languages: ['TypeScript', 'JavaScript', 'Python'],
                  requireSkillMd: true,
                  excludeArchived: true,
                })}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                重置默认
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                保存配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 任务历史标签页 */}
      {activeTab === 'tasks' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">任务历史</h3>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentTasks.map((task, idx) => (
                  <li key={task.id}>
                    <div className="relative pb-8">
                      {idx !== recentTasks.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            task.status === 'completed' ? 'bg-green-100' :
                            task.status === 'failed' ? 'bg-red-100' :
                            task.status === 'processing' ? 'bg-purple-100' :
                            'bg-yellow-100'
                          }`}>
                            <svg className={`h-5 w-5 ${
                              task.status === 'completed' ? 'text-green-600' :
                              task.status === 'failed' ? 'text-red-600' :
                              task.status === 'processing' ? 'text-purple-600' :
                              'text-yellow-600'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">{task.taskType.replace('_', ' ')}</span>
                              {' '}
                              <span className="text-gray-500">- {task.target.substring(0, 50)}{task.target.length > 50 ? '...' : ''}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              状态: 
                              <span className={`ml-1 font-medium ${
                                task.status === 'completed' ? 'text-green-600' :
                                task.status === 'failed' ? 'text-red-600' :
                                task.status === 'processing' ? 'text-purple-600' :
                                'text-yellow-600'
                              }`}>
                                {task.status === 'completed' ? '完成' :
                                 task.status === 'failed' ? '失败' :
                                 task.status === 'processing' ? '处理中' :
                                 '等待中'}
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={task.createdAt.toISOString()}>
                              {new Date(task.createdAt).toLocaleString('zh-CN')}
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
      )}

      {/* 立即启动爬虫模态框 */}
      {isStartCrawlModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认启动爬虫</h3>
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <p><strong>数据源:</strong> {dataSources.filter(ds => ds.enabled).map(ds => ds.name).join(', ') || '无'}</p>
              <p><strong>批量大小:</strong> {config.batchSize}</p>
              <p><strong>并发限制:</strong> {config.concurrentLimit}</p>
              <p><strong>专项搜索:</strong> {config.isSpecializedSearch ? '是' : '否'}</p>
              <p><strong>质量阈值:</strong> {config.qualityThreshold}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsStartCrawlModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleStartCrawl}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                确认启动
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 全量同步确认模态框 */}
      {isFullSyncModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认执行全量同步</h3>
            <p className="text-gray-600 mb-6">
              全量同步将从种子仓库开始，自动发现并爬取相关的 AI Agent Skills。
              这个过程可能需要较长时间，确定要继续吗？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsFullSyncModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/crawler/start', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ mode: 'full_sync' }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                      alert(`✅ 全量同步已启动！\n\n${JSON.stringify(data.result, null, 2)}`);
                    } else {
                      alert(`❌ 启动失败：${data.error}`);
                    }
                    setIsFullSyncModalOpen(false);
                  } catch (error) {
                    console.error('Failed to start full sync:', error);
                    alert('❌ 启动失败：' + (error instanceof Error ? error.message : '未知错误'));
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                确认执行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

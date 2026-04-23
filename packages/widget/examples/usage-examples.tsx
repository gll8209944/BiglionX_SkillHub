/**
 * SkillHub Widget 使用示例
 * 
 * 展示如何在不同场景中使用 @skillhub/widget 组件
 */

import React from 'react';
import type { SkillSearchResult } from '@skillhub/search-sdk';
import { useSkillSearch } from '../src/hooks/useSkillSearch';
import { SkillStoreWidget, SkillSearchWidget, MySkillsManager } from '../src';

// ============================================
// 示例 1: 在开发者工具中集成搜索功能
// ============================================
export function DeveloperToolExample() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">AI Agent 开发工具</h2>
      <SkillSearchWidget
        apiUrl="https://api.skillhub.com"
        placeholder="搜索可复用的 Skills..."
        showAdvancedFilter={true}
        onSkillClick={(skill: SkillSearchResult) => {
          // 将选中的 Skill 添加到当前项目
          console.log('添加 Skill 到项目:', skill.name);
          // addToProject(skill);
        }}
      />
    </div>
  );
}

// ============================================
// 示例 2: 企业内部 Skill 管理平台
// ============================================
export function EnterpriseExample() {
  const userToken = 'your-auth-token'; // 从认证系统获取

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">企业 Skill 管理中心</h2>
      <MySkillsManager
        apiUrl="https://internal-skillhub.company.com"
        authToken={userToken}
        allowPublish={true}
        allowEdit={true}
        allowDelete={true}
        theme={{
          primaryColor: '#1e40af', // 企业品牌色
          borderRadius: '0.5rem',
        }}
        onSkillPublish={(skillId: string) => {
          // 通知团队新 Skill 已发布
          console.log('通知团队:', skillId);
          // notifyTeam(skillId);
        }}
      />
    </div>
  );
}

// ============================================
// 示例 3: 教育平台集成
// ============================================
export function EducationPlatformExample() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">AI Agent 学习平台</h2>
      <SkillStoreWidget
        apiUrl="https://edu-skillhub.com"
        defaultView="search"
        showTabs={true}
        theme={{
          primaryColor: '#10b981',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          fontSize: 'lg',
        }}
        onSkillClick={(skill: SkillSearchResult) => {
          // 记录学生学习行为
          console.log('学生查看了:', skill.name);
          // trackStudentActivity(skill.id);
        }}
      />
    </div>
  );
}

// ============================================
// 示例 4: 自定义搜索界面（使用 Hooks）
// ============================================
export function CustomSearchWithHooks() {
  const { results, loading, search, semanticSearch } = useSkillSearch({
    apiUrl: 'https://api.skillhub.com',
  });

  const handleKeywordSearch = async () => {
    const results = await search({ 
      query: 'python automation',
      category: 'development',
    });
    console.log('关键词搜索结果:', results);
  };

  const handleSemanticSearch = async () => {
    const results = await semanticSearch('如何自动处理 Excel 数据', 10);
    console.log('语义搜索结果:', results);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">自定义搜索界面</h2>
      <div className="flex gap-3 mb-4">
        <button 
          onClick={handleKeywordSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {loading ? '搜索中...' : '关键词搜索'}
        </button>
        <button 
          onClick={handleSemanticSearch}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          {loading ? '搜索中...' : '语义搜索'}
        </button>
      </div>
      
      <ul className="space-y-2">
        {results.map((skill: SkillSearchResult) => (
          <li key={skill.id} className="p-3 border rounded-lg">
            <div className="font-semibold">{skill.name}</div>
            <div className="text-sm text-gray-600">{skill.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================
// 示例 5: 深色主题定制
// ============================================
export function DarkThemeExample() {
  return (
    <div className="p-6 bg-gray-900">
      <h2 className="text-xl font-bold mb-4 text-white">深色主题示例</h2>
      <SkillStoreWidget
        apiUrl="https://api.skillhub.com"
        theme={{
          primaryColor: '#60a5fa',
          backgroundColor: '#1f2937',
          textColor: '#f3f4f6',
          borderColor: '#374151',
          borderRadius: '0.75rem',
        }}
      />
    </div>
  );
}

// ============================================
// 示例 6: 最小化配置（快速开始）
// ============================================
export function MinimalExample() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">最小化配置</h2>
      {/* 仅需一行代码即可集成 */}
      <SkillStoreWidget />
    </div>
  );
}

// ============================================
// 示例 7: 与现有 UI 库集成
// ============================================
export function WithUILibraryExample() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">与 UI 库集成</h2>
      
      {/* 可以与 Ant Design、Material-UI 等共存 */}
      <div className="border rounded-lg overflow-hidden">
        <SkillSearchWidget
          apiUrl="https://api.skillhub.com"
          theme={{
            primaryColor: '#1890ff', // Ant Design 蓝色
            borderRadius: '4px',
          }}
        />
      </div>
    </div>
  );
}

// ============================================
// 示例 8: 响应式布局
// ============================================
export function ResponsiveLayoutExample() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">响应式布局</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：搜索 */}
        <div>
          <h3 className="font-semibold mb-2">搜索 Skills</h3>
          <SkillSearchWidget
            apiUrl="https://api.skillhub.com"
            showResults={true}
          />
        </div>
        
        {/* 右侧：管理 */}
        <div>
          <h3 className="font-semibold mb-2">我的 Skills</h3>
          <MySkillsManager
            apiUrl="https://api.skillhub.com"
            allowPublish={false} // 只读模式
          />
        </div>
      </div>
    </div>
  );
}

// ============================================
// 导出所有示例
// ============================================
export default {
  DeveloperToolExample,
  EnterpriseExample,
  EducationPlatformExample,
  CustomSearchWithHooks,
  DarkThemeExample,
  MinimalExample,
  WithUILibraryExample,
  ResponsiveLayoutExample,
};

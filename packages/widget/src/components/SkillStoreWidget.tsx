'use client';

import React, { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { SkillSearchWidget } from './SkillSearchWidget';
import { MySkillsManager } from './MySkillsManager';
import type { SkillStoreWidgetProps } from '../types';

export function SkillStoreWidget({
  apiUrl = 'http://localhost:3000/api',
  authToken,
  defaultView = 'search',
  showTabs = true,
  className = '',
  theme,
  onSearchComplete,
  onSkillClick,
  onSkillUpdate,
  onSkillPublish,
}: SkillStoreWidgetProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'my-skills'>(defaultView);

  const themeStyles = {
    '--widget-primary': theme?.primaryColor || '#3b82f6',
    '--widget-bg': theme?.backgroundColor || '#ffffff',
    '--widget-text': theme?.textColor || '#1f2937',
    '--widget-border': theme?.borderColor || '#e5e7eb',
    '--widget-radius': theme?.borderRadius || '0.5rem',
  } as React.CSSProperties;

  return (
    <div className={`skill-store-widget ${className}`} style={themeStyles}>
      {/* 标签切换 */}
      {showTabs && (
        <div className="flex gap-2 mb-6 border-b" style={{ borderColor: 'var(--widget-border)' }}>
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px`}
            style={{
              color: activeTab === 'search' ? 'var(--widget-primary)' : 'var(--widget-text)',
              borderColor: activeTab === 'search' ? 'var(--widget-primary)' : 'transparent',
            }}
          >
            <Search className="w-4 h-4" />
            搜索 Skills
          </button>
          <button
            onClick={() => setActiveTab('my-skills')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px`}
            style={{
              color: activeTab === 'my-skills' ? 'var(--widget-primary)' : 'var(--widget-text)',
              borderColor: activeTab === 'my-skills' ? 'var(--widget-primary)' : 'transparent',
            }}
          >
            <Package className="w-4 h-4" />
            我的 Skills
          </button>
        </div>
      )}

      {/* 内容区域 */}
      <div>
        {activeTab === 'search' ? (
          <SkillSearchWidget
            apiUrl={apiUrl}
            showAdvancedFilter={true}
            showResults={true}
            theme={theme}
            onSearchComplete={onSearchComplete}
            onSkillClick={onSkillClick}
          />
        ) : (
          <MySkillsManager
            apiUrl={apiUrl}
            authToken={authToken}
            allowPublish={true}
            allowEdit={true}
            allowDelete={true}
            theme={theme}
            onSkillUpdate={onSkillUpdate}
            onSkillPublish={onSkillPublish}
          />
        )}
      </div>
    </div>
  );
}

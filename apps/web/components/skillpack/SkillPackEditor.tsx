'use client';

import { useState } from 'react';
import { Search, X, Plus, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

interface SkillItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder?: number;
}

interface SkillPackEditorProps {
  value: SkillItem[];
  onChange: (skills: SkillItem[]) => void;
}

export function SkillPackEditor({ value, onChange }: SkillPackEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SkillItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchSkills = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/skills?search=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        const skills = data?.data?.skills || [];
        // 过滤掉已在包中的技能
        const existingIds = new Set(value.map((s) => s.id));
        setSearchResults(skills.filter((s: SkillItem) => !existingIds.has(s.id)));
      }
    } catch {
      console.error('搜索技能失败');
    } finally {
      setIsSearching(false);
    }
  };

  const addSkill = (skill: SkillItem) => {
    if (!value.find((s) => s.id === skill.id)) {
      onChange([...value, { ...skill, sortOrder: value.length }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeSkill = (skillId: string) => {
    onChange(value.filter((s) => s.id !== skillId));
  };

  const moveSkill = (index: number, direction: 'up' | 'down') => {
    const newSkills = [...value];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSkills.length) return;
    [newSkills[index], newSkills[targetIndex]] = [newSkills[targetIndex], newSkills[index]];
    onChange(newSkills);
  };

  return (
    <div className="space-y-4">
      {/* 搜索添加区 */}
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
          <Search className="h-4 w-4 text-gray-400 ml-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => searchSkills(e.target.value)}
            placeholder="搜索并添加子技能..."
            className="w-full px-3 py-2 text-sm border-none outline-none"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="pr-3 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((skill) => (
              <button
                key={skill.id}
                type="button"
                onClick={() => addSkill(skill)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{skill.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-60">{skill.description}</p>
                </div>
                <Plus className="h-4 w-4 text-blue-500 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-400">
            搜索中...
          </div>
        )}
      </div>

      {/* 已选子技能列表 */}
      {value.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          暂无子技能，请在上方搜索添加
        </div>
      ) : (
        <div className="space-y-2">
          {value.map((skill, index) => (
            <div
              key={skill.id}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{skill.name}</p>
                <p className="text-xs text-gray-500 truncate">{skill.description}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveSkill(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSkill(index, 'down')}
                  disabled={index === value.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.id)}
                  className="p-1 text-gray-400 hover:text-red-500 ml-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        已选择 {value.length} 个子技能，拖拽可调整顺序
      </p>
    </div>
  );
}

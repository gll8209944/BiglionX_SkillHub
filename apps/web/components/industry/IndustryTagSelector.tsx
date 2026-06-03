'use client';

const INDUSTRY_TAGS = [
  { id: '餐饮', label: '餐饮', plugin: 'catering' },
  { id: '美业', label: '美业', plugin: 'beauty' },
  { id: '宠物', label: '宠物', plugin: 'pet' },
  { id: '零售', label: '零售', plugin: 'retail' },
  { id: '进销存', label: '进销存', plugin: 'inventory' },
  { id: '云服务', label: '云服务', plugin: 'cloud-proclaw' },
  { id: '虚拟公司', label: '虚拟公司', plugin: 'virtual-company' },
  { id: '维修', label: '维修', plugin: '' },
  { id: '通用', label: '通用', plugin: '' },
];

interface IndustryTagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

export function IndustryTagSelector({ value, onChange, disabled }: IndustryTagSelectorProps) {
  const toggleTag = (tagId: string) => {
    if (disabled) return;
    if (value.includes(tagId)) {
      onChange(value.filter((t) => t !== tagId));
    } else {
      onChange([...value, tagId]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        行业标签
      </label>
      <div className="flex flex-wrap gap-2">
        {INDUSTRY_TAGS.map((tag) => {
          const isSelected = value.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              disabled={disabled}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${isSelected
                  ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-300'
                  : 'bg-gray-50 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100'
                }
                ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-gray-400">
          已选择 {value.length} 个行业标签
        </p>
      )}
    </div>
  );
}

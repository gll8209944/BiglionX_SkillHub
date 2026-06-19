'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';

type Operator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between';

interface Condition {
  field: string;
  operator: Operator;
  value: string;
}

interface Action {
  type: string;
  params: Record<string, string>;
}

interface RuleData {
  conditions: Condition[];
  conditionLogic: 'AND' | 'OR';
  actions: Action[];
  priority: number;
  enabled: boolean;
}

interface RuleEditorProps {
  value: RuleData;
  onChange: (data: RuleData) => void;
}

const OPERATORS: { value: Operator; label: string }[] = [
  { value: 'equals', label: '等于' },
  { value: 'not_equals', label: '不等于' },
  { value: 'greater_than', label: '大于' },
  { value: 'less_than', label: '小于' },
  { value: 'contains', label: '包含' },
  { value: 'in', label: '在列表中' },
  { value: 'between', label: '在范围内' },
];

const COMMON_FIELD_EXAMPLES = [
  { field: 'order.total_amount', label: '订单总金额' },
  { field: 'order.customer.is_member', label: '是否会员' },
  { field: 'order.item_count', label: '商品数量' },
  { field: 'order.status', label: '订单状态' },
];

const ACTION_TYPES = [
  { type: 'add_order_item', label: '添加商品', params: [{ key: 'product_id', label: '商品ID' }, { key: 'name', label: '商品名称' }, { key: 'price', label: '价格' }] },
  { type: 'send_notification', label: '发送通知', params: [{ key: 'target', label: '通知目标' }, { key: 'message', label: '通知内容' }] },
  { type: 'apply_discount', label: '应用折扣', params: [{ key: 'percent', label: '折扣百分比' }, { key: 'reason', label: '折扣原因' }] },
  { type: 'update_order_status', label: '更新订单状态', params: [{ key: 'status', label: '新状态' }] },
];

const defaultRule: RuleData = {
  conditions: [{ field: '', operator: 'equals', value: '' }],
  conditionLogic: 'AND',
  actions: [{ type: '', params: {} }],
  priority: 1,
  enabled: true,
};

export function RuleEditor({ value, onChange }: RuleEditorProps) {
  const [showFieldExamples, setShowFieldExamples] = useState(false);

  const updateCondition = (index: number, updates: Partial<Condition>) => {
    const newConditions = value.conditions.map((c, i) => i === index ? { ...c, ...updates } : c);
    onChange({ ...value, conditions: newConditions });
  };

  const addCondition = () => {
    onChange({ ...value, conditions: [...value.conditions, { field: '', operator: 'equals', value: '' }] });
  };

  const removeCondition = (index: number) => {
    if (value.conditions.length <= 1) return;
    onChange({ ...value, conditions: value.conditions.filter((_, i) => i !== index) });
  };

  const updateAction = (index: number, updates: Partial<Action>) => {
    const newActions = value.actions.map((a, i) => i === index ? { ...a, ...updates } : a);
    onChange({ ...value, actions: newActions });
  };

  const addAction = () => {
    onChange({ ...value, actions: [...value.actions, { type: '', params: {} }] });
  };

  const removeAction = (index: number) => {
    if (value.actions.length <= 1) return;
    onChange({ ...value, actions: value.actions.filter((_, i) => i !== index) });
  };

  const selectActionType = (index: number, type: string) => {
    const actionDef = ACTION_TYPES.find((a) => a.type === type);
    const params: Record<string, string> = {};
    if (actionDef) {
      actionDef.params.forEach((p) => { params[p.key] = ''; });
    }
    updateAction(index, { type, params });
  };

  const updateActionParam = (actionIndex: number, key: string, val: string) => {
    const newActions = value.actions.map((a: Action, i: number) => {
      if (i !== actionIndex) return a;
      return { ...a, params: { ...a.params, [key]: val } };
    });
    onChange({ ...value, actions: newActions });
  };

  const applyFieldExample = (field: string) => {
    if (value.conditions.length > 0) {
      updateCondition(0, { field });
    }
    setShowFieldExamples(false);
  };

  return (
    <div className="space-y-6">
      {/* 条件编辑区 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">触发条件</h4>

        {/* 条件间逻辑选择 */}
        {value.conditions.length > 1 && (
          <div className="mb-3">
            <select
              value={value.conditionLogic}
              onChange={(e) => onChange({ ...value, conditionLogic: e.target.value as 'AND' | 'OR' })}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="AND">全部满足 (AND)</option>
              <option value="OR">满足任一 (OR)</option>
            </select>
            <span className="text-xs text-gray-400 ml-2">时触发</span>
          </div>
        )}

        <div className="space-y-2">
          {value.conditions.map((condition, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-6 shrink-0">{index + 1}.</span>

              {/* 字段路径 */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={condition.field}
                  onChange={(e) => updateCondition(index, { field: e.target.value })}
                  placeholder="字段路径 (如 order.total_amount)"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  onFocus={() => index === 0 && setShowFieldExamples(true)}
                  onBlur={() => setTimeout(() => setShowFieldExamples(false), 200)}
                />
                {showFieldExamples && index === 0 && (
                  <div className="absolute z-10 top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2">
                      <p className="text-xs text-gray-400 mb-1 px-2">常用字段</p>
                      {COMMON_FIELD_EXAMPLES.map((ex) => (
                        <button
                          key={ex.field}
                          type="button"
                          onMouseDown={() => applyFieldExample(ex.field)}
                          className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded"
                        >
                          <span className="font-medium">{ex.label}</span>
                          <span className="text-gray-400 ml-2 text-xs">{ex.field}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 运算符 */}
              <select
                value={condition.operator}
                onChange={(e) => updateCondition(index, { operator: e.target.value as Operator })}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded"
              >
                {OPERATORS.map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>

              {/* 值 */}
              <input
                type="text"
                value={condition.value}
                onChange={(e) => updateCondition(index, { value: e.target.value })}
                placeholder={condition.operator === 'between' ? '最小值,最大值' : '值'}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
              />

              {/* 删除 */}
              {value.conditions.length > 1 && (
                <button type="button" onClick={() => removeCondition(index)} className="p-1 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addCondition}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> 添加条件
        </button>
      </div>

      {/* 动作编辑区 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">执行动作</h4>

        <div className="space-y-3">
          {value.actions.map((action, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <GripVertical className="h-4 w-4 text-gray-300" />
                <span className="text-xs text-gray-400">动作 {index + 1}</span>

                <select
                  value={action.type}
                  onChange={(e) => selectActionType(index, e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
                >
                  <option value="">选择动作类型...</option>
                  {ACTION_TYPES.map((at) => (
                    <option key={at.type} value={at.type}>{at.label}</option>
                  ))}
                </select>

                {value.actions.length > 1 && (
                  <button type="button" onClick={() => removeAction(index)} className="p-1 text-gray-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* 动作参数 */}
              {action.type && (
                <div className="ml-6 space-y-2">
                  {Object.entries(action.params).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-20 shrink-0">{key}</span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => updateActionParam(index, key, e.target.value)}
                        placeholder={`输入 ${key}`}
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addAction}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <Plus className="h-3 w-3" /> 添加动作
        </button>
      </div>

      {/* 优先级与启用开关 */}
      <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700">优先级</label>
          <input
            type="number"
            min={0}
            max={100}
            value={value.priority}
            onChange={(e) => onChange({ ...value, priority: parseInt(e.target.value) || 0 })}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
          />
          <span className="text-xs text-gray-400">数字越小优先级越高</span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-gray-700">启用</span>
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );
}

export { defaultRule };
export type { RuleData, Condition, Action, Operator };

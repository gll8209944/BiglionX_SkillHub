/**
 * RuleEngine - 业务规则引擎服务
 * 支持 if-then 条件规则的定义、验证和执行
 * 支持 AND/OR/NOT 条件组合，多种运算符和动作链
 */

export type Operator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'between';
export type ConditionGroupOperator = 'AND' | 'OR' | 'NOT';

export interface RuleCondition {
  field: string;
  operator: Operator;
  value: unknown;
}

export interface ConditionGroup {
  operator: ConditionGroupOperator;
  conditions: RuleCondition[];
  groups?: ConditionGroup[];
}

export interface RuleAction {
  type: string;
  params: Record<string, unknown>;
}

export interface RuleDefinition {
  id: string;
  name: string;
  conditions: ConditionGroup[];
  actions: RuleAction[];
  priority: number;
  enabled: boolean;
}

export interface RuleEvaluationResult {
  matched: boolean;
  ruleName: string;
  ruleId: string;
  priority: number;
  triggeredActions: RuleAction[];
  details: string[];
}

export class RuleEngine {
  /**
   * 评估单个条件
   */
  evaluateCondition(condition: RuleCondition, context: Record<string, unknown>): boolean {
    const fieldValue = this.getNestedValue(context, condition.field);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;

      case 'not_equals':
        return fieldValue !== condition.value;

      case 'greater_than':
        if (typeof fieldValue === 'number' && typeof condition.value === 'number') {
          return fieldValue > condition.value;
        }
        if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
          return parseFloat(fieldValue) > parseFloat(condition.value);
        }
        return false;

      case 'less_than':
        if (typeof fieldValue === 'number' && typeof condition.value === 'number') {
          return fieldValue < condition.value;
        }
        if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
          return parseFloat(fieldValue) < parseFloat(condition.value);
        }
        return false;

      case 'contains':
        if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
          return fieldValue.includes(condition.value);
        }
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condition.value);
        }
        return false;

      case 'in':
        if (Array.isArray(condition.value)) {
          return (condition.value as unknown[]).includes(fieldValue);
        }
        return false;

      case 'between':
        if (Array.isArray(condition.value) && condition.value.length === 2) {
          const min = condition.value[0] as number;
          const max = condition.value[1] as number;
          if (typeof fieldValue === 'number') {
            return fieldValue >= min && fieldValue <= max;
          }
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * 评估条件组
   */
  evaluateConditionGroup(group: ConditionGroup, context: Record<string, unknown>): boolean {
    const conditionResults = group.conditions.map((c) => this.evaluateCondition(c, context));
    const groupResults = group.groups
      ? group.groups.map((g) => this.evaluateConditionGroup(g, context))
      : [];

    const allResults = [...conditionResults, ...groupResults];

    if (allResults.length === 0) return false;

    switch (group.operator) {
      case 'AND':
        return allResults.every(Boolean);

      case 'OR':
        return allResults.some(Boolean);

      case 'NOT':
        return !allResults.some(Boolean);

      default:
        return false;
    }
  }

  /**
   * 评估单条规则
   */
  evaluateRule(rule: RuleDefinition, context: Record<string, unknown>): RuleEvaluationResult {
    const details: string[] = [];

    if (!rule.enabled) {
      return {
        matched: false,
        ruleName: rule.name,
        ruleId: rule.id,
        priority: rule.priority,
        triggeredActions: [],
        details: [`规则「${rule.name}」已禁用`],
      };
    }

    // 评估所有条件组（组之间为 AND 关系）
    const groupResults = rule.conditions.map((group, index) => {
      const result = this.evaluateConditionGroup(group, context);
      details.push(`条件组 ${index + 1}（${group.operator}）：${result ? '通过' : '不通过'}`);
      return result;
    });

    const matched = groupResults.length === 0 || groupResults.every(Boolean);

    if (matched) {
      details.push(`规则「${rule.name}」匹配成功，触发 ${rule.actions.length} 个动作`);
    } else {
      details.push(`规则「${rule.name}」匹配失败`);
    }

    return {
      matched,
      ruleName: rule.name,
      ruleId: rule.id,
      priority: rule.priority,
      triggeredActions: matched ? rule.actions : [],
      details,
    };
  }

  /**
   * 按优先级批量评估规则
   */
  evaluateRules(rules: RuleDefinition[], context: Record<string, unknown>): RuleEvaluationResult[] {
    // 按优先级排序（数字越小优先级越高）
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    return sortedRules
      .filter((r) => r.enabled)
      .map((rule) => this.evaluateRule(rule, context))
      .filter((r) => r.matched);
  }

  /**
   * 验证规则定义结构
   */
  validateRule(rule: RuleDefinition): { valid: boolean; error?: string } {
    if (!rule.name || rule.name.trim().length === 0) {
      return { valid: false, error: '规则名称不能为空' };
    }

    if (!rule.conditions || rule.conditions.length === 0) {
      return { valid: false, error: '规则至少需要一个条件' };
    }

    for (let i = 0; i < rule.conditions.length; i++) {
      const group = rule.conditions[i];
      const validation = this.validateConditionGroup(group);
      if (!validation.valid) {
        return { valid: false, error: `条件组 ${i + 1}：${validation.error}` };
      }
    }

    if (!rule.actions || rule.actions.length === 0) {
      return { valid: false, error: '规则至少需要一个动作' };
    }

    for (let i = 0; i < rule.actions.length; i++) {
      const action = rule.actions[i];
      if (!action.type || action.type.trim().length === 0) {
        return { valid: false, error: `动作 ${i + 1} 类型不能为空` };
      }
    }

    if (typeof rule.priority !== 'number' || rule.priority < 0) {
      return { valid: false, error: '优先级必须为大于等于 0 的数字' };
    }

    return { valid: true };
  }

  /**
   * 验证条件组结构
   */
  private validateConditionGroup(group: ConditionGroup): { valid: boolean; error?: string } {
    if (!['AND', 'OR', 'NOT'].includes(group.operator)) {
      return { valid: false, error: `无效的条件组运算符「${group.operator}」，必须为 AND/OR/NOT` };
    }

    if (!group.conditions || group.conditions.length === 0) {
      return { valid: false, error: '条件组至少需要一个条件' };
    }

    const validOperators: Operator[] = ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'between'];

    for (let i = 0; i < group.conditions.length; i++) {
      const cond = group.conditions[i];
      if (!cond.field || cond.field.trim().length === 0) {
        return { valid: false, error: `条件 ${i + 1} 字段路径不能为空` };
      }
      if (!validOperators.includes(cond.operator)) {
        return { valid: false, error: `条件 ${i + 1} 运算符「${cond.operator}」无效` };
      }
      if (cond.value === undefined || cond.value === null) {
        return { valid: false, error: `条件 ${i + 1} 值不能为空` };
      }
    }

    // 递归验证子组
    if (group.groups) {
      for (let i = 0; i < group.groups.length; i++) {
        const result = this.validateConditionGroup(group.groups[i]);
        if (!result.valid) {
          return { valid: false, error: `子条件组 ${i + 1}：${result.error}` };
        }
      }
    }

    return { valid: true };
  }

  /**
   * 从上下文中获取嵌套字段值（支持点号路径）
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined;
      }
      if (typeof current === 'object' && key in (current as Record<string, unknown>)) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return current;
  }
}

// 导出单例
export const ruleEngine = new RuleEngine();

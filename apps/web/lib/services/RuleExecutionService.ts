/**
 * RuleExecutionService - 规则执行服务
 * 接收规则定义和上下文数据，返回执行结果
 */
import { ruleEngine } from './RuleEngine';
import type { RuleDefinition, RuleEvaluationResult } from './RuleEngine';

export interface ExecutionContext {
  [key: string]: unknown;
}

export interface ExecutionResult {
  matched: boolean;
  results: RuleEvaluationResult[];
  summary: string;
}

export class RuleExecutionService {
  /**
   * 执行单条规则
   */
  executeSingleRule(rule: RuleDefinition, context: ExecutionContext): RuleEvaluationResult {
    return ruleEngine.evaluateRule(rule, context);
  }

  /**
   * 批量执行规则并按优先级排序结果
   */
  executeRules(rules: RuleDefinition[], context: ExecutionContext): ExecutionResult {
    const results = ruleEngine.evaluateRules(rules, context);

    const matchedCount = results.filter((r) => r.matched).length;
    const actionCount = results.reduce((sum, r) => sum + r.triggeredActions.length, 0);

    return {
      matched: matchedCount > 0,
      results,
      summary: `匹配 ${matchedCount} 条规则，共触发 ${actionCount} 个动作`,
    };
  }

  /**
   * 从技能定义中提取规则
   */
  extractRuleFromSkill(skill: { id: string; name: string; content: unknown }): RuleDefinition | null {
    if (!skill.content || typeof skill.content !== 'object') return null;

    const content = skill.content as Record<string, unknown>;
    if (!content.conditions || !content.actions) return null;

    try {
      return {
        id: skill.id,
        name: skill.name,
        conditions: content.conditions as RuleDefinition['conditions'],
        actions: content.actions as RuleDefinition['actions'],
        priority: (content.priority as number) || 1,
        enabled: content.enabled !== false,
      };
    } catch {
      return null;
    }
  }

  /**
   * 提取动作摘要（用于展示）
   */
  getActionSummary(actions: RuleEvaluationResult['triggeredActions']): string[] {
    return actions.map((action) => {
      switch (action.type) {
        case 'add_order_item':
          return `添加商品: ${(action.params.name as string) || (action.params.product_id as string)}`;
        case 'send_notification':
          return `通知 ${action.params.target as string}: ${action.params.message as string}`;
        case 'apply_discount':
          return `应用 ${action.params.percent as string}% 折扣`;
        case 'update_order_status':
          return `更新订单状态为: ${action.params.status as string}`;
        default:
          return `执行动作: ${action.type}`;
      }
    });
  }
}

export const ruleExecutionService = new RuleExecutionService();

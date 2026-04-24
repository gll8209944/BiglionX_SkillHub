import { NextResponse } from 'next/server';

// 强制动态渲染
export const dynamic = 'force-dynamic';

/**
 * GET /api/tools/discovery
 * 为 AI Agent (如 Flowise) 提供简化的工具发现接口
 */
export async function GET() {
  const tools = [
    {
      id: 'skillhub-search',
      name: 'Search Skills',
      description: '在 SkillHub 中搜索 AI 技能、工具和库。当你需要查找特定功能的代码实现或 AI 代理时使用。',
      endpoint: '/api/search',
      method: 'GET',
      parameters: [
        { name: 'q', type: 'string', required: true, description: '搜索关键词' },
        { name: 'category', type: 'string', required: false, description: '分类过滤' },
      ],
    },
    {
      id: 'skillhub-get-detail',
      name: 'Get Skill Details',
      description: '获取特定技能的详细文档、版本信息和仓库地址。',
      endpoint: '/api/skills/{slug}',
      method: 'GET',
      parameters: [
        { name: 'slug', type: 'string', required: true, description: '技能的唯一标识符' },
      ],
    },
    {
      id: 'skillhub-semantic-search',
      name: 'Semantic Search',
      description: '使用自然语言进行语义搜索，寻找功能相似的技能。',
      endpoint: '/api/search/semantic',
      method: 'GET',
      parameters: [
        { name: 'q', type: 'string', required: true, description: '自然语言查询' },
      ],
    },
    {
      id: 'skillhub-list-bounties',
      name: 'List Bounties',
      description: '查看当前开放的技能开发悬赏任务。',
      endpoint: '/api/bounties',
      method: 'GET',
      parameters: [],
    },
  ];

  return new NextResponse(JSON.stringify({
    platform: 'SkillHub',
    version: '1.0.0',
    tools: tools,
    documentation: '/api/openapi',
  }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

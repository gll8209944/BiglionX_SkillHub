import { NextResponse } from 'next/server';

// 强制动态渲染
export const dynamic = 'force-dynamic';

// OpenAPI 规范类型定义
interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    description: string;
    version: string;
    contact?: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, unknown>;
  components?: {
    schemas?: Record<string, unknown>;
  };
}

// 简单的内存缓存，避免每次请求都重新生成庞大的 JSON
let cachedSpec: OpenApiSpec | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * GET /api/openapi
 * 生成 OpenAPI 3.0 规范文档，用于 Flowise 等 AI Agent 平台自动发现和集成 SkillHub API
 */
export async function GET() {
  const now = Date.now();
  
  // 检查缓存是否有效
  if (cachedSpec && (now - cacheTimestamp < CACHE_TTL)) {
    return new NextResponse(JSON.stringify(cachedSpec), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const openApiSpec = {
    openapi: '3.0.0',
    info: {
      title: 'SkillHub API',
      description: 'SkillHub 是一个开放的 AI 技能市场。此 API 允许开发者动态发现、搜索和管理 AI Skills，并将其作为工具集成到 Flowise 等自动化工作流中。',
      version: '1.0.0',
      contact: {
        name: 'SkillHub Support',
        url: 'https://skillhub.ai',
      },
    },
    servers: [
      {
        url: baseUrl,
        description: 'SkillHub Production Server',
      },
    ],
    paths: {
      '/api/search': {
        get: {
          summary: '搜索 Skills',
          description: '根据关键词、分类、语言等条件搜索可用的 AI 技能。这是 Flowise 查找特定功能工具的主要入口。',
          operationId: 'searchSkills',
          tags: ['Skills'],
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: '搜索关键词（例如：web scraping, data analysis）',
            },
            {
              name: 'category',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: '技能分类',
            },
            {
              name: 'language',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: '编程语言过滤',
            },
          ],
          responses: {
            '200': {
              description: '成功返回搜索结果',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      skills: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Skill' },
                      },
                      total: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/skills/{slug}': {
        get: {
          summary: '获取 Skill 详情',
          description: '获取特定技能的详细信息，包括版本、作者和使用说明。',
          operationId: 'getSkillBySlug',
          tags: ['Skills'],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: '技能详情',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SkillDetail' },
                },
              },
            },
          },
        },
      },
      '/api/search/semantic': {
        get: {
          summary: '语义搜索 Skills',
          description: '使用向量相似度进行语义搜索，适合自然语言查询。',
          operationId: 'semanticSearch',
          tags: ['Search'],
          parameters: [
            {
              name: 'q',
              in: 'query',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: '语义搜索结果',
            },
          },
        },
      },
      '/api/bounties': {
        get: {
          summary: '获取悬赏列表',
          description: '查看当前开放的技能开发悬赏任务。',
          operationId: 'listBounties',
          tags: ['Bounties'],
          responses: {
            '200': { description: '悬赏列表' },
          },
        },
        post: {
          summary: '创建新悬赏',
          description: '发布一个新的技能开发需求。',
          operationId: 'createBounty',
          tags: ['Bounties'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'reward'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    reward: { type: 'number' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: '创建成功' },
          },
        },
      },
    },
    components: {
      schemas: {
        Skill: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            author: {
              type: 'object',
              properties: {
                name: { type: 'string' },
              },
            },
          },
        },
        SkillDetail: {
          allOf: [
            { $ref: '#/components/schemas/Skill' },
            {
              type: 'object',
              properties: {
                repositoryUrl: { type: 'string' },
                versions: {
                  type: 'array',
                  items: { type: 'object' },
                },
              },
            },
          ],
        },
      },
    },
  };

  // 更新缓存
  cachedSpec = openApiSpec;
  cacheTimestamp = now;

  return new NextResponse(JSON.stringify(openApiSpec), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
}

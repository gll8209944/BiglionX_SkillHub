import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { semanticSearchService } from '@/lib/search/SemanticSearchService';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { auth } from '@/lib/auth-config';

/**
 * POST /api/admin/generate-embeddings
 * 批量为Skills生成embeddings（仅管理员可用）
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    // 检查是否为管理员
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return errorResponse('需要管理员权限', 403);
    }

    const body = await request.json();
    const { skillIds, batchSize = 10 } = body;

    // 如果没有指定skillIds，则为所有没有embedding的skills生成
    let targetSkillIds: string[];
    
    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      targetSkillIds = skillIds;
    } else {
      // 获取所有没有embedding的已批准skills
      const allApprovedSkills = await prisma.skill.findMany({
        where: {
          status: 'APPROVED',
        },
        select: { id: true, embedding: true },
      });
      
      // 过滤出没有embedding的skills
      const skillsWithoutEmbeddings = allApprovedSkills.filter(
        skill => !skill.embedding
      );
      
      targetSkillIds = skillsWithoutEmbeddings.map(s => s.id);
      
      if (targetSkillIds.length === 0) {
        return successResponse({
          message: '所有Skills已有embeddings',
          processedCount: 0,
        });
      }
    }

    console.log(`📊 开始为 ${targetSkillIds.length} 个Skills生成embeddings`);

    // 批量生成embeddings
    const successCount = await semanticSearchService.generateEmbeddingsForSkills(
      targetSkillIds,
      batchSize
    );

    return successResponse({
      message: `成功生成 ${successCount}/${targetSkillIds.length} 个embeddings`,
      processedCount: successCount,
      totalCount: targetSkillIds.length,
    });
  } catch (error) {
    console.error('❌ 批量生成embeddings失败:', error);
    return errorResponse('批量生成embeddings失败', 500);
  }
}

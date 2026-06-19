import { NextResponse } from 'next/server';
import { getDatabaseStatus } from '@/lib/db-health';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug/skills-error
 * 调试接口：检查 /skills 页面可能的错误源
 */
export async function GET() {
  const results: Record<string, unknown> = {};
  
  try {
    // 1. 检查数据库连接
    console.log('🔍 Checking database connection...');
    const dbStatus = await getDatabaseStatus();
    results.database = dbStatus;
    
    if (!dbStatus.connected) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbStatus,
      }, { status: 500 });
    }
    
    // 2. 尝试查询 skills（模拟 /skills 页面的操作）
    console.log('🔍 Testing skill query...');
    const skillCount = await prisma.skill.count({
      where: {
        status: 'APPROVED',
        isPublic: true,
      },
    });
    results.skillCount = skillCount;
    
    // 3. 测试 auth 函数
    console.log('🔍 Testing auth function...');
    try {
      const { auth } = await import('@/lib/auth-config');
      const session = await auth();
      results.auth = {
        available: true,
        hasSession: !!session,
      };
    } catch (authError) {
      results.auth = {
        available: false,
        error: authError instanceof Error ? authError.message : String(authError),
      };
    }
    
    // 4. 测试分类统计查询
    console.log('🔍 Testing category stats query...');
    const categoryStats = await prisma.skill.groupBy({
      by: ['category'],
      _count: true,
      where: {
        status: 'APPROVED',
        isPublic: true,
      },
    });
    results.categoryStats = {
      count: categoryStats.length,
      categories: categoryStats,
    };
    
    // 5. 测试一个简单的技能查询
    console.log('🔍 Testing skill findMany...');
    const sampleSkills = await prisma.skill.findMany({
      where: {
        status: 'APPROVED',
        isPublic: true,
      },
      take: 1,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        namespace: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });
    results.sampleSkills = {
      count: sampleSkills.length,
      firstSkill: sampleSkills[0] ? {
        id: sampleSkills[0].id,
        name: sampleSkills[0].name,
        hasAuthor: !!sampleSkills[0].author,
        hasNamespace: !!sampleSkills[0].namespace,
      } : null,
    };
    
    return NextResponse.json({
      status: 'success',
      message: 'All checks passed',
      results,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Debug check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined,
      results,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

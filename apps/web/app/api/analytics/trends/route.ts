import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // 计算时间范围
    const now = new Date();
    let startDate = new Date();
    let groupBy: 'day' | 'week' = 'day';
    
    if (period === '7d') {
      startDate.setDate(now.getDate() - 7);
      groupBy = 'day';
    } else if (period === '30d') {
      startDate.setDate(now.getDate() - 30);
      groupBy = 'day';
    } else if (period === '90d') {
      startDate.setDate(now.getDate() - 90);
      groupBy = 'week';
    }

    // 获取时间范围内的 Skills
    const skills = await prisma.skill.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        createdAt: true,
        downloadCount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // 按天或按周分组统计数据
    const groupedData: Record<string, { date: string; skills: number; downloads: number }> = {};
    
    skills.forEach(skill => {
      const date = new Date(skill.createdAt);
      let key: string;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        // 按周分组，使用该周的第一天作为 key
        const dayOfWeek = date.getDay();
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - dayOfWeek);
        key = weekStart.toISOString().split('T')[0];
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { date: key, skills: 0, downloads: 0 };
      }
      
      groupedData[key].skills += 1;
      groupedData[key].downloads += skill.downloadCount;
    });

    // 转换为数组并排序
    const trendData = Object.values(groupedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json({
      success: true,
      data: trendData,
    });
  } catch (error) {
    console.error('获取趋势数据失败:', error);
    return NextResponse.json(
      { error: '获取趋势数据失败' },
      { status: 500 }
    );
  }
}

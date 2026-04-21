import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/crawler/config
 * 获取爬虫配置
 */
export async function GET() {
  try {
    const session = await requireAdminSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized or insufficient permissions' }, { status: 403 });
    }

    const config = await prisma.crawlerConfig.findUnique({
      where: { configKey: 'crawler_settings' },
    });

    if (!config) {
      return NextResponse.json({ config: null });
    }

    return NextResponse.json({ config: config.configValue });
  } catch (error) {
    console.error('Failed to get crawler config:', error);
    return NextResponse.json(
      { error: 'Failed to get crawler config' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/crawler/config
 * 更新爬虫配置
 */
export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized or insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Config is required' },
        { status: 400 }
      );
    }

    await prisma.crawlerConfig.upsert({
      where: { configKey: 'crawler_settings' },
      update: {
        configValue: config,
        updatedAt: new Date(),
      },
      create: {
        configKey: 'crawler_settings',
        configValue: config,
        description: '爬虫系统配置',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save crawler config:', error);
    return NextResponse.json(
      { error: 'Failed to save crawler config' },
      { status: 500 }
    );
  }
}

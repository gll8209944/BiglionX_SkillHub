import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Next.js 14 App Router segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/upload
 * 上传文件（图标、截图等）
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('未找到文件', 400);
    }

    // 验证文件类型
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'application/zip', 'application/json'];
    if (!allowedTypes.includes(file.type)) {
      return errorResponse('不支持的文件类型', 400);
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse('文件大小不能超过 10MB', 400);
    }

    // 生成唯一文件名
    const ext = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${ext}`;
    
    // 确定上传目录
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // 返回文件 URL
    const fileUrl = `/uploads/${fileName}`;

    return successResponse({
      url: fileUrl,
      fileName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('文件上传失败:', error);
    return errorResponse('文件上传失败', 500);
  }
}

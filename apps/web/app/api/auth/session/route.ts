/**
 * GET /api/auth/session
 * 
 * 返回当前 session 供客户端 useSession hook 使用
 * 替代 next-auth/react 的 SessionProvider 数据源
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth-config';

export async function GET() {
  try {
    const session = await auth();
    return NextResponse.json(session ?? { user: null });
  } catch (err) {
    console.error('[Session API] Error:', err);
    return NextResponse.json({ user: null });
  }
}

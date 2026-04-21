import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import type { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // 验证必填字段
    if (!token || !newPassword) {
      return NextResponse.json(
        { error: '令牌和新密码为必填项' },
        { status: 400 }
      );
    }

    // 验证密码强度
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: '密码长度至少为8个字符' },
        { status: 400 }
      );
    }

    const passwordStrengthRegex = /^(?=.*[A-Za-z])(?=.*\d)/;
    if (!passwordStrengthRegex.test(newPassword)) {
      return NextResponse.json(
        { error: '密码必须包含字母和数字' },
        { status: 400 }
      );
    }

    // 查找具有有效重置令牌的用户
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token as string,
        resetTokenExpiry: {
          gt: new Date(), // 令牌未过期
        },
      } as Prisma.UserWhereInput,
    });

    if (!user) {
      return NextResponse.json(
        { error: '无效或已过期的重置令牌' },
        { status: 400 }
      );
    }

    // 哈希新密码
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 更新用户密码并清除重置令牌
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json(
      { message: '密码重置成功' },
      { status: 200 }
    );
  } catch (error) {
    console.error('重置密码失败:', error);
    return NextResponse.json(
      { error: '重置失败，请稍后重试' },
      { status: 500 }
    );
  }
}

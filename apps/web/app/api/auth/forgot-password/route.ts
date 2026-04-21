import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // 验证邮箱
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 为了安全，即使用户不存在也返回成功消息（防止枚举攻击）
    if (!user) {
      return NextResponse.json(
        { message: '如果该邮箱已注册，我们已发送密码重置链接' },
        { status: 200 }
      );
    }

    // 生成重置令牌和过期时间（1小时后过期）
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1小时

    // 保存重置令牌到数据库
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // 发送重置邮件
    const resend = new Resend(process.env.RESEND_API_KEY);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'SkillHub <noreply@skillhub.com>',
        to: email,
        subject: 'SkillHub - 密码重置',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">密码重置请求</h2>
            <p>您好，${user.name || '用户'}</p>
            <p>我们收到了您的密码重置请求。请点击下面的链接重置您的密码：</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                重置密码
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">或者复制链接到浏览器：</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">
              ${resetUrl}
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              ⚠️ 此链接将在 1 小时后过期。<br>
              如果您没有请求重置密码，请忽略此邮件。
            </p>
          </div>
        `,
      });

      console.log('✓ 密码重置邮件已发送至:', email);
    } catch (emailError) {
      console.error('发送邮件失败:', emailError);
      // 即使邮件发送失败，也返回成功（防止枚举攻击）
    }

    return NextResponse.json(
      { message: '如果该邮箱已注册，我们已发送密码重置链接' },
      { status: 200 }
    );
  } catch (error) {
    console.error('忘记密码处理失败:', error);
    return NextResponse.json(
      { error: '处理失败，请稍后重试' },
      { status: 500 }
    );
  }
}

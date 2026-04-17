import { NextRequest } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { errorResponse, unauthorizedResponse } from '@/lib/api-response';

/**
 * POST /api/auth/change-password
 * 修改用户密码
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // 验证输入
    if (!currentPassword || !newPassword) {
      return errorResponse('当前密码和新密码为必填项', 400);
    }

    if (newPassword.length < 8) {
      return errorResponse('新密码长度至少为8个字符', 400);
    }

    // 获取用户(包含密码)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: {
          where: {
            provider: 'credentials',
          },
        },
      },
    });

    if (!user) {
      return errorResponse('用户不存在', 404);
    }

    // 检查是否使用凭证登录
    const credentialsAccount = user.accounts[0];
    if (!credentialsAccount) {
      return errorResponse('此账户不支持密码修改(可能使用 OAuth 登录)', 400);
    }

    // TODO: 实际项目中需要从 accounts 表获取密码哈希
    // 这里简化处理，假设密码存储在某个地方
    // 对于 OAuth 用户，应该返回错误提示

    return errorResponse('OAuth 登录用户无法修改密码', 400);

    // 以下是使用凭证登录的逻辑(如果需要):
    // 1. 验证当前密码
    // const isValid = await bcrypt.compare(currentPassword, storedHash);
    // if (!isValid) {
    //   return errorResponse('当前密码不正确', 401);
    // }

    // 2. 哈希新密码
    // const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. 更新密码
    // await prisma.account.update({
    //   where: { id: credentialsAccount.id },
    //   data: { password: hashedPassword },
    // });

    // return successResponse({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码失败:', error);
    return errorResponse('修改密码失败', 500);
  }
}

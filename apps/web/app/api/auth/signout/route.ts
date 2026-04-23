import { signOut } from '@/lib/auth-config';
import { redirect } from 'next/navigation';

export async function POST() {
  await signOut({ redirect: false });
  // 登出后跳转到首页（会自动重定向到 /skills）
  // 这样用户可以继续浏览公开内容，提升用户体验
  redirect('/');
}

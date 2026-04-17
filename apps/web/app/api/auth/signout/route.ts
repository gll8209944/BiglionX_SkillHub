import { signOut } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export async function POST() {
  await signOut({ redirect: false });
  redirect('/login');
}

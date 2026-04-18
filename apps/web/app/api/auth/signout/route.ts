import { signOut } from '@/lib/auth-config';
import { redirect } from 'next/navigation';

export async function POST() {
  await signOut({ redirect: false });
  redirect('/login');
}

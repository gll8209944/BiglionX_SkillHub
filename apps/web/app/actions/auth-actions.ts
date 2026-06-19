'use server'

import { redirect } from 'next/navigation';

export async function handleSignOut() {
  redirect('/auth/logout');
}

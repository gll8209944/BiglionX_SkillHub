'use server'

import { signOut } from '@/lib/auth-config'

export async function handleSignOut() {
  await signOut({ redirectTo: '/' })
}

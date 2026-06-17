import { redirect } from 'next/navigation';

export default function ResetPasswordPage() {
  redirect('https://account.proclaw.cc/login');
  return null;
}

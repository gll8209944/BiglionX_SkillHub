import { redirect } from 'next/navigation';

export default function ForgotPasswordPage() {
  redirect('https://account.proclaw.cc/forgot');
  return null;
}

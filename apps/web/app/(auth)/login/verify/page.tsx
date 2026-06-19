import { redirect } from 'next/navigation';

export default function VerifyPage() {
  redirect('https://account.proclaw.cc/login');
  return null;
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { ToastProvider } from '@/components/ui/ToastContainer';
import { startScheduler } from '@/lib/services/TaskScheduler';

const inter = Inter({ subsets: ['latin'] });

// Start scheduler on server-side (only once)
let schedulerStarted = false;
if (typeof window === 'undefined' && !schedulerStarted) {
  console.log('\n🚀 ========================================');
  console.log('🚀 Starting SkillHub Task Scheduler from Layout...');
  console.log('🚀 ========================================\n');
  
  console.log('Environment Check:');
  console.log(`  GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  SKILLSMP_API_KEY: ${process.env.SKILLSMP_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Configured' : '❌ Missing'}`);
  console.log('');
  
  startScheduler();
  schedulerStarted = true;
  console.log('\n✅ Task Scheduler initialized successfully from Layout\n');
}

export const metadata: Metadata = {
  title: 'Skill Hub - AI Agent Skills Registry',
  description: 'Enterprise-grade, open-source AI agent skill registry',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ReactQueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

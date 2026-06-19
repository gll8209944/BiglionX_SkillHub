'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Bell, Key } from 'lucide-react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard/settings', label: '个人资料', icon: User },
    { href: '/dashboard/settings/security', label: '账户安全', icon: Shield },
    { href: '/dashboard/settings/notifications', label: '通知设置', icon: Bell },
    { href: '/dashboard/settings/api-keys', label: 'API 密钥', icon: Key },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* 侧边栏导航 */}
      <aside className="w-64 bg-white border-r hidden md:block">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      
      {/* 移动端导航 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <nav className="flex justify-around p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center px-2 py-1 text-xs ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="truncate max-w-15">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* 主内容区 */}
      <main className="flex-1 p-6 pb-20 md:pb-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}

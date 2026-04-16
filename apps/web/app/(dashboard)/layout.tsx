import { auth } from '@/app/api/auth/[...nextauth]/route';
import { signOut } from 'next-auth/react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Skill Hub</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center space-x-2">
                    {user.image && (
                      <img
                        src={user.image}
                        alt={user.name || 'User'}
                        className="h-8 w-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    退出登录
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

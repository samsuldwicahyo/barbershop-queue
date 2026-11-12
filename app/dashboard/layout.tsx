import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import Link from 'next/link';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  async function handleLogout() {
    'use server';
    const { deleteSessionCookie } = await import('@/lib/session');
    await deleteSessionCookie();
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 text-white p-4">
        <h2 className="text-xl font-bold mb-2">Dashboard</h2>
        <p className="text-sm text-slate-400 mb-8">
          {user.barbershop?.name || 'Super Admin'}
        </p>

        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-3 py-2 rounded hover:bg-slate-800">
            🏠 Home
          </Link>
          <Link href="/dashboard/queue" className="block px-3 py-2 rounded hover:bg-slate-800">
            📋 Queue
          </Link>
          <Link href="/dashboard/bookings" className="block px-3 py-2 rounded hover:bg-slate-800">
            📅 Bookings
          </Link>
          {(user.role === 'SUPER_ADMIN' || user.role === 'SHOP_ADMIN') && (
            <>
              <Link href="/dashboard/barbers" className="block px-3 py-2 rounded hover:bg-slate-800">
                💈 Barbers
              </Link>
              <Link href="/dashboard/settings" className="block px-3 py-2 rounded hover:bg-slate-800">
                ⚙️ Settings
              </Link>
            </>
          )}
          {user.role === 'SUPER_ADMIN' && (
            <Link href="/dashboard/barbershops" className="block px-3 py-2 rounded hover:bg-slate-800">
              🏢 Barbershops
            </Link>
          )}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="border-t border-slate-700 pt-4">
            <p className="text-sm text-slate-400">{user.name}</p>
            <p className="text-xs text-slate-500">{user.role}</p>
            <form action={handleLogout} className="mt-2">
              <button type="submit" className="text-sm text-red-400 hover:text-red-300">
                🚪 Logout
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-slate-800">
              Dashboard - {user.role.replace('_', ' ')}
            </h1>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
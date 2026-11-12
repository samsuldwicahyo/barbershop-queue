import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';

export default async function DashboardHomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
      <p className="text-slate-600 mt-1">
        Selamat datang, {user.name}. Pilih menu untuk mengelola barbershop.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/queue" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">📋 Queue</h3>
          <p className="text-sm text-slate-600">Kelola antrian pelanggan hari ini</p>
        </Link>

        <Link href="/dashboard/bookings" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">📅 Bookings</h3>
          <p className="text-sm text-slate-600">Lihat riwayat booking terbaru</p>
        </Link>

        {(user.role === 'SUPER_ADMIN' || user.role === 'SHOP_ADMIN') && (
          <Link href="/dashboard/barbers" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">💈 Barbers</h3>
            <p className="text-sm text-slate-600">Kelola barber dan ketersediaan</p>
          </Link>
        )}

        {(user.role === 'SUPER_ADMIN' || user.role === 'SHOP_ADMIN') && (
          <Link href="/dashboard/settings" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">⚙️ Settings</h3>
            <p className="text-sm text-slate-600">Atur jam operasional dan libur</p>
          </Link>
        )}

        {user.role === 'SUPER_ADMIN' && (
          <Link href="/dashboard/barbershops" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">🏢 Barbershops</h3>
            <p className="text-sm text-slate-600">Kelola semua barbershop</p>
          </Link>
        )}
      </div>
    </div>
  );
}

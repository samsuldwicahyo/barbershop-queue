import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export default async function BarbershopsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  const barbershops = await prisma.barbershop.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      city: true,
      province: true,
      isActive: true,
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Barbershops</h2>

      {barbershops.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-slate-600">
          Belum ada barbershop.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
            <div className="col-span-4">Nama</div>
            <div className="col-span-3">Slug</div>
            <div className="col-span-2">Lokasi</div>
            <div className="col-span-2">Telepon</div>
            <div className="col-span-1 text-right">Status</div>
          </div>

          <div className="divide-y divide-slate-100">
            {barbershops.map((shop) => (
              <div key={shop.id} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm">
                <div className="col-span-4 font-medium text-slate-900">{shop.name}</div>
                <div className="col-span-3 text-slate-600">{shop.slug}</div>
                <div className="col-span-2 text-slate-600">
                  {[shop.city, shop.province].filter(Boolean).join(', ') || '-'}
                </div>
                <div className="col-span-2 text-slate-600">{shop.phone ?? '-'}</div>
                <div className="col-span-1 text-right">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      shop.isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {shop.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

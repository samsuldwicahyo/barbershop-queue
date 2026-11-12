import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function PublicBarbershopsPage() {
  const barbershops = await prisma.barbershop.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      province: true,
      phone: true,
    },
  });

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Pilih Barbershop</h1>
          <p className="text-slate-600">
            Pilih barbershop, isi data, pilih barber, dan ambil nomor antrian.
          </p>
        </div>

        {barbershops.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            Belum ada barbershop aktif.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {barbershops.map((shop) => (
              <Link
                key={shop.id}
                href={`/public/${shop.slug}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow"
              >
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-slate-900">{shop.name}</h2>
                  <div className="text-sm text-slate-600">
                    {shop.address ?? '-'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {[shop.city, shop.province].filter(Boolean).join(', ') || '—'}
                  </div>
                  {shop.phone && (
                    <div className="text-xs text-slate-500">WA: {shop.phone}</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

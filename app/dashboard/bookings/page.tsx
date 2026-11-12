
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export default async function BookingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'SUPER_ADMIN' && !user.barbershopId) {
    redirect('/dashboard');
  }

  const where =
    user.barbershopId
      ? { barbershopId: user.barbershopId }
      : {};

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      barber: { select: { name: true } },
      barbershop: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Bookings</h2>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-slate-600">
          Belum ada booking.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="grid grid-cols-12 gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
            <div className="col-span-2">Tanggal</div>
            <div className="col-span-1">No</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-3">Barber</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Shop</div>
          </div>

          <div className="divide-y divide-slate-100">
            {bookings.map((booking: any) => (
              <div key={booking.id} className="grid grid-cols-12 gap-4 px-4 py-3 text-sm">
                <div className="col-span-2 text-slate-600">
                  {new Date(booking.bookingDate).toLocaleDateString('id-ID')}
                </div>
                <div className="col-span-1 font-semibold">{booking.queueNumber}</div>
                <div className="col-span-3">
                  <p className="font-medium text-slate-900">{booking.customerName}</p>
                  <p className="text-xs text-slate-500">{booking.customerPhone ?? '-'}</p>
                </div>
                <div className="col-span-3 text-slate-700">{booking.barber.name}</div>
                <div className="col-span-2 text-slate-700">{booking.status}</div>
                <div className="col-span-1 text-right text-slate-600">
                  {booking.barbershop?.name ?? '-'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

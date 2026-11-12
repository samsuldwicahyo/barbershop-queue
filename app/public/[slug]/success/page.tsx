import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bookingId?: string }>;
}) {
  const { bookingId } = await searchParams;
  const { slug } = await params;

  if (!bookingId) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      barbershop: true,
      barber: {
        include: {
          barberProfile: true,
        },
      },
    },
  });

  if (!booking || booking.barbershop.slug !== slug) {
    notFound();
  }

  const barberName = booking.barber.barberProfile?.displayName || booking.barber.name;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Booking Berhasil</h1>
          <p className="mt-2 text-slate-600">
            Terima kasih, {booking.customerName}. Ini nomor antrian kamu.
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <div className="text-sm text-slate-600">Nomor Antrian</div>
            <div className="text-4xl font-bold text-slate-900">#{booking.queueNumber}</div>
            <div className="mt-2 text-sm text-slate-600">Barber: {barberName}</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/public/${slug}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-white"
          >
            Lihat Antrian
          </Link>
          <Link href="/public" className="text-sm text-slate-600 hover:text-slate-900">
            Pilih Barbershop Lain
          </Link>
        </div>
      </div>
    </main>
  );
}

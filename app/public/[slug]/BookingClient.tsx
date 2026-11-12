import Link from 'next/link';
import { submitBooking } from './actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type QueueItem = {
  queueNumber: number;
  status: string;
};

type Barber = {
  id: string;
  name: string;
  displayName: string | null;
};

type Barbershop = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
};

type BookingClientProps = {
  barbershop: Barbershop;
  queueItems: QueueItem[];
  isOpen: boolean;
  barbers: Barber[];
  bookingDate: string;
};

export default function BookingClient({
  barbershop,
  queueItems,
  isOpen,
  barbers,
  bookingDate,
}: BookingClientProps) {
  const submitBookingWithSlug = submitBooking.bind(null, barbershop.slug);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{barbershop.name}</h1>
              {barbershop.address && (
                <p className="text-sm text-slate-600">{barbershop.address}</p>
              )}
              {barbershop.phone && <p className="text-sm text-slate-600">{barbershop.phone}</p>}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Ambil Nomor Antrian</h2>
          {!isOpen && (
            <p className="mt-2 text-sm text-red-600">
              Barbershop sedang tutup. Silakan kembali saat jam operasional.
            </p>
          )}
          {barbers.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">Belum ada barber tersedia.</p>
          ) : (
            <form action={submitBookingWithSlug} className="mt-4 space-y-4">
              <input type="hidden" name="bookingDate" value={bookingDate} />
              <div>
                <label htmlFor="barberId" className="block text-sm font-medium text-slate-700">
                  Pilih Barber *
                </label>
                <select
                  id="barberId"
                  name="barberId"
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Pilih barber</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.displayName || barber.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input label="Nama *" name="customerName" id="customerName" required />
              <Input
                label="Nomor WhatsApp *"
                name="customerPhone"
                id="customerPhone"
                type="tel"
                required
              />

              <div>
                <label htmlFor="customerNotes" className="block text-sm font-medium text-slate-700">
                  Catatan (opsional)
                </label>
                <textarea
                  id="customerNotes"
                  name="customerNotes"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={!isOpen || barbers.length === 0}>
                  Ambil Nomor Antrian
                </Button>
                <Link href="/public" className="text-sm text-slate-600 hover:text-slate-900">
                  Kembali
                </Link>
              </div>
            </form>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Queue Today</h2>
          {queueItems.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">No queue yet.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {queueItems.map((item) => (
                <div
                  key={item.queueNumber}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-slate-900">#{item.queueNumber}</span>
                  <span className="text-slate-600">{item.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

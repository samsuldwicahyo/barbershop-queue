type QueueItem = {
  queueNumber: number;
  status: string;
};

type Barbershop = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
};

type BookingClientProps = {
  barbershop: Barbershop;
  queueItems: QueueItem[];
  isOpen: boolean;
};

export default function BookingClient({ barbershop, queueItems, isOpen }: BookingClientProps) {
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
              {barbershop.phone && (
                <p className="text-sm text-slate-600">{barbershop.phone}</p>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isOpen
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
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

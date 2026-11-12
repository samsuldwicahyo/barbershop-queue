import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { redirect } from 'next/navigation';

export default async function BarbersPage() {
  const user = await getCurrentUser();

  if (!user || !user.barbershopId) {
    redirect('/dashboard');
  }

  // Get all barbers for this barbershop
  const barbers = await prisma.user.findMany({
    where: {
      barbershopId: user.barbershopId,
      role: 'BARBER',
    },
    include: {
      barberProfile: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Barbers</h2>
        <Link href="/dashboard/barbers/new">
          <Button>+ Add Barber</Button>
        </Link>
      </div>

      {barbers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-slate-600 mb-4">No barbers yet.</p>
          <Link href="/dashboard/barbers/new">
            <Button>Add First Barber</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {barbers.map((barber) => (
            <div key={barber.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {barber.barberProfile?.displayName || barber.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        barber.isActive && barber.barberProfile?.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {barber.isActive && barber.barberProfile?.isAvailable
                        ? 'Available'
                        : 'Unavailable'}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-slate-600">Email:</dt>
                      <dd className="font-medium">{barber.email}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-600">Phone:</dt>
                      <dd className="font-medium">{barber.phone || '-'}</dd>
                    </div>
                  </dl>

                  {barber.barberProfile?.bio && (
                    <p className="mt-2 text-sm text-slate-600">{barber.barberProfile.bio}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/dashboard/barbers/${barber.id}/edit`}>
                    <Button variant="secondary" className="text-sm">
                      Edit
                    </Button>
                  </Link>
                  <form action={`/dashboard/barbers/${barber.id}/delete`} method="POST">
                    <Button variant="danger" type="submit" className="text-sm">
                      Delete
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
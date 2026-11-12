import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/prisma';
import { updateBarber } from '../../actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default async function EditBarberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  if (!user || !user.barbershopId) {
    redirect('/dashboard');
  }

  // Get barber (multi-tenant check)
  const barber = await prisma.user.findUnique({
    where: { id },
    include: { barberProfile: true },
  });

  if (!barber || barber.barbershopId !== user.barbershopId || barber.role !== 'BARBER') {
    notFound();
  }

  const updateBarberWithId = updateBarber.bind(null, id);

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/barbers" className="text-blue-600 hover:underline">
          ← Back to Barbers
        </Link>
      </div>

      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Edit Barber</h2>

        <form action={updateBarberWithId} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={barber.email}
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 text-slate-600"
            />
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
          </div>

          <Input
            label="Name *"
            type="text"
            name="name"
            id="name"
            required
            defaultValue={barber.name}
          />

          <Input
            label="Phone"
            type="tel"
            name="phone"
            id="phone"
            defaultValue={barber.phone || ''}
          />

          <hr className="my-6" />

          <h3 className="font-semibold text-lg">Barber Profile</h3>

          <Input
            label="Display Name *"
            type="text"
            name="displayName"
            id="displayName"
            required
            defaultValue={barber.barberProfile?.displayName || ''}
          />

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              defaultValue={barber.barberProfile?.bio || ''}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isAvailable"
              id="isAvailable"
              value="true"
              defaultChecked={barber.barberProfile?.isAvailable}
              className="w-4 h-4"
            />
            <label htmlFor="isAvailable" className="text-sm font-medium text-slate-700">
              Available for bookings
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">Update Barber</Button>
            <Link href="/dashboard/barbers">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
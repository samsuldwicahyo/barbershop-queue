import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/prisma';
import { createHoliday, deleteHoliday } from './actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import { formatDateInput } from '@/lib/utils';

export default async function HolidaysPage() {
  const user = await getCurrentUser();

  if (!user || !user.barbershopId) {
    redirect('/dashboard');
  }

  // Get all holidays
  const holidays = await prisma.holiday.findMany({
    where: { barbershopId: user.barbershopId },
    orderBy: { date: 'asc' },
  });

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/settings" className="text-blue-600 hover:underline">
          ← Back to Settings
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">Holidays</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add Holiday Form */}
        <div>
          <h3 className="font-semibold mb-4">Add New Holiday</h3>
          <form action={createHoliday} className="bg-white rounded-lg shadow p-6 space-y-4">
            <Input label="Date *" type="date" name="date" id="date" required />

            <Input
              label="Description"
              type="text"
              name="description"
              id="description"
              placeholder="e.g., New Year's Day"
            />

            <Button type="submit">Add Holiday</Button>
          </form>
        </div>

        {/* Holidays List */}
        <div>
          <h3 className="font-semibold mb-4">
            Existing Holidays ({holidays.length})
          </h3>

          {holidays.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-slate-600">
              No holidays set
            </div>
          ) : (
            <div className="space-y-3">
              {holidays.map((holiday) => (
                <div key={holiday.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {new Date(holiday.date).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {holiday.description && (
                      <p className="text-sm text-slate-600">{holiday.description}</p>
                    )}
                  </div>

                  <form action={deleteHoliday.bind(null, holiday.id)}>
                    <Button variant="danger" type="submit" className="text-sm">
                      Delete
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
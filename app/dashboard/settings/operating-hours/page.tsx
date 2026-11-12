import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import prisma from '@/lib/prisma';
import { updateOperatingHours } from './actions';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { DayOfWeek } from '@prisma/client';

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday',
};

export default async function OperatingHoursPage() {
  const user = await getCurrentUser();

  if (!user || !user.barbershopId) {
    redirect('/dashboard');
  }

  // Get all operating hours
  const operatingHours = await prisma.operatingHours.findMany({
    where: { barbershopId: user.barbershopId },
    orderBy: {
      dayOfWeek: 'asc',
    },
  });

  // Create map for easy access
  const hoursMap = new Map(operatingHours.map((h) => [h.dayOfWeek, h]));

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/settings" className="text-blue-600 hover:underline">
          ← Back to Settings
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-6">Operating Hours</h2>

      <form action={updateOperatingHours} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow divide-y">
          {Object.entries(DAY_LABELS).map(([day, label]) => {
            const hours = hoursMap.get(day as DayOfWeek);
            return (
              <div key={day} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name={`${day}_isOpen`}
                        defaultChecked={hours?.isOpen ?? true}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{label}</span>
                    </label>
                  </div>

                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="time"
                      name={`${day}_openTime`}
                      defaultValue={hours?.openTime || '09:00'}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    />
                    <span className="text-slate-600">to</span>
                    <input
                      type="time"
                      name={`${day}_closeTime`}
                      defaultValue={hours?.closeTime || '21:00'}
                      className="px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <Button type="submit">Save Operating Hours</Button>
        </div>
      </form>
    </div>
  );
}
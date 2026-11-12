'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { UserRole, DayOfWeek } from '@prisma/client';
import { isValidTimeRange } from '@/lib/utils';

export async function updateOperatingHours(formData: FormData) {
  const user = await getCurrentUser();

  if (!user || (user.role !== UserRole.SHOP_ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    throw new Error('Unauthorized');
  }

  if (!user.barbershopId) {
    throw new Error('Barbershop ID required');
  }

  // Parse all days
  const days = Object.values(DayOfWeek);

  for (const day of days) {
    const isOpen = formData.get(`${day}_isOpen`) === 'on';
    const openTime = formData.get(`${day}_openTime`) as string;
    const closeTime = formData.get(`${day}_closeTime`) as string;

    // Validate time range if open
    if (isOpen && openTime && closeTime && !isValidTimeRange(openTime, closeTime)) {
      throw new Error(`Invalid time range for ${day}`);
    }

    // Upsert
    await prisma.operatingHours.upsert({
      where: {
        barbershopId_dayOfWeek: {
          barbershopId: user.barbershopId,
          dayOfWeek: day,
        },
      },
      update: {
        isOpen,
        openTime: isOpen ? openTime : null,
        closeTime: isOpen ? closeTime : null,
      },
      create: {
        barbershopId: user.barbershopId,
        dayOfWeek: day,
        isOpen,
        openTime: isOpen ? openTime : null,
        closeTime: isOpen ? closeTime : null,
      },
    });
  }

  revalidatePath('/dashboard/settings/operating-hours');
}
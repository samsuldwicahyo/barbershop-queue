'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { UserRole } from '@prisma/client';

export async function createHoliday(formData: FormData) {
  const user = await getCurrentUser();

  if (!user || (user.role !== UserRole.SHOP_ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    throw new Error('Unauthorized');
  }

  if (!user.barbershopId) {
    throw new Error('Barbershop ID required');
  }

  const date = formData.get('date') as string;
  const description = formData.get('description') as string;

  if (!date) {
    throw new Error('Date required');
  }

  await prisma.holiday.create({
    data: {
      barbershopId: user.barbershopId,
      date: new Date(date),
      description: description || null,
    },
  });

  revalidatePath('/dashboard/settings/holidays');
}

export async function deleteHoliday(holidayId: string) {
  const user = await getCurrentUser();

  if (!user || (user.role !== UserRole.SHOP_ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    throw new Error('Unauthorized');
  }

  // Multi-tenant check
  const holiday = await prisma.holiday.findUnique({
    where: { id: holidayId },
  });

  if (!holiday || holiday.barbershopId !== user.barbershopId) {
    throw new Error('Holiday not found or unauthorized');
  }

  await prisma.holiday.delete({
    where: { id: holidayId },
  });

  revalidatePath('/dashboard/settings/holidays');
}
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { hashPassword } from '@/lib/auth';
import { UserRole } from '@prisma/client';

/**
 * Create new barber
 */
export async function createBarber(formData: FormData) {
  const user = await getCurrentUser();

  // Check permission
  if (!user || (user.role !== UserRole.SHOP_ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    throw new Error('Unauthorized');
  }

  if (!user.barbershopId) {
    throw new Error('Barbershop ID required');
  }

  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;
  const bio = formData.get('bio') as string;

  // Validate
  if (!email || !name || !password || !displayName) {
    throw new Error('Required fields missing');
  }

  // Check email unique
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Create user + barber profile (transaction)
  await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        name,
        phone,
        role: UserRole.BARBER,
        barbershopId: user.barbershopId!,
        passwordHash: await hashPassword(password),
        isActive: true,
      },
    });

    await tx.barberProfile.create({
      data: {
        userId: newUser.id,
        barbershopId: user.barbershopId!,
        displayName,
        bio: bio || null,
        isAvailable: true,
      },
    });
  });

  revalidatePath('/dashboard/barbers');
  redirect('/dashboard/barbers');
}

/**
 * Update barber
 */
export async function updateBarber(barberId: string, formData: FormData) {
  const user = await getCurrentUser();

  if (!user || (user.role !== UserRole.SHOP_ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const displayName = formData.get('displayName') as string;
  const bio = formData.get('bio') as string;
  const isAvailable = formData.get('isAvailable') === 'true';

  // Multi-tenant check
  const barberUser = await prisma.user.findUnique({
    where: { id: barberId },
    include: { barberProfile: true },
  });

  if (!barberUser || barberUser.barbershopId !== user.barbershopId) {
    throw new Error('Barber not found or unauthorized');
  }

  // Update
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: barberId },
      data: { name, phone },
    });

    if (barberUser.barberProfile) {
      await tx.barberProfile.update({
        where: { userId: barberId },
        data: { displayName, bio, isAvailable },
      });
    }
  });

  revalidatePath('/dashboard/barbers');
  redirect('/dashboard/barbers');
}

/**
 * Delete barber (soft delete - set inactive)
 */
export async function deleteBarber(barberId: string) {
  const user = await getCurrentUser();

  if (!user || (user.role !== UserRole.SHOP_ADMIN && user.role !== UserRole.SUPER_ADMIN)) {
    throw new Error('Unauthorized');
  }

  // Multi-tenant check
  const barberUser = await prisma.user.findUnique({
    where: { id: barberId },
  });

  if (!barberUser || barberUser.barbershopId !== user.barbershopId) {
    throw new Error('Barber not found or unauthorized');
  }

  // Soft delete
  await prisma.user.update({
    where: { id: barberId },
    data: { isActive: false },
  });

  revalidatePath('/dashboard/barbers');
}
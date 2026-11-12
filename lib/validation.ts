import prisma from '@/lib/prisma';
import { DayOfWeek, SubscriptionStatus } from '@prisma/client';

/**
 * Get day of week enum from Date
 */
function getDayOfWeek(date: Date): DayOfWeek {
  const days: DayOfWeek[] = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];
  return days[date.getDay()];
}

/**
 * Check if barbershop has active subscription
 */
export async function hasActiveSubscription(barbershopId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findFirst({
    where: {
      barbershopId,
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!subscription) {
    return false;
  }

  // Check TRIAL expiry (14 days from created)
  if (subscription.status === SubscriptionStatus.TRIAL) {
    const trialEndDate = new Date(subscription.createdAt);
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    if (new Date() > trialEndDate) {
      return false;
    }
  }

  // Check ACTIVE expiry
  if (subscription.status === SubscriptionStatus.ACTIVE) {
    if (subscription.endDate && new Date() > subscription.endDate) {
      return false;
    }
  }

  return true;
}

/**
 * Check if barbershop is open on given date
 */
export async function isShopOpen(barbershopId: string, date: Date): Promise<boolean> {
  const dayOfWeek = getDayOfWeek(date);

  const operatingHours = await prisma.operatingHours.findUnique({
    where: {
      barbershopId_dayOfWeek: {
        barbershopId,
        dayOfWeek,
      },
    },
  });

  return operatingHours?.isOpen ?? false;
}

/**
 * Check if date is a holiday
 */
export async function isHoliday(barbershopId: string, date: Date): Promise<boolean> {
  // Normalize date to midnight UTC for comparison
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  const holiday = await prisma.holiday.findFirst({
    where: {
      barbershopId,
      date: dateOnly,
    },
  });

  return holiday !== null;
}

/**
 * Check if barber is available
 */
export async function isBarberAvailable(barberId: string): Promise<boolean> {
  const barberProfile = await prisma.barberProfile.findUnique({
    where: { userId: barberId },
    include: { user: true },
  });

  return barberProfile?.isAvailable && barberProfile.user.isActive ? true : false;
}

/**
 * Validate booking request
 * Returns { valid: boolean, error?: string }
 */
export async function validateBooking(
  barbershopId: string,
  barberId: string,
  bookingDate: Date
): Promise<{ valid: boolean; error?: string }> {
  // 1. Check subscription
  const hasSubscription = await hasActiveSubscription(barbershopId);
  if (!hasSubscription) {
    return {
      valid: false,
      error: 'Barbershop subscription is not active. Please contact the shop.',
    };
  }

  // 2. Check date not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookingDateOnly = new Date(bookingDate);
  bookingDateOnly.setHours(0, 0, 0, 0);

  if (bookingDateOnly < today) {
    return { valid: false, error: 'Cannot book for past dates.' };
  }

  // 3. Check shop open
  const shopOpen = await isShopOpen(barbershopId, bookingDate);
  if (!shopOpen) {
    return { valid: false, error: 'Barbershop is closed on this day.' };
  }

  // 4. Check holiday
  const holiday = await isHoliday(barbershopId, bookingDate);
  if (holiday) {
    return { valid: false, error: 'Barbershop is closed on this date (holiday).' };
  }

  // 5. Check barber available
  const barberAvailable = await isBarberAvailable(barberId);
  if (!barberAvailable) {
    return { valid: false, error: 'Selected barber is not available.' };
  }

  return { valid: true };
}
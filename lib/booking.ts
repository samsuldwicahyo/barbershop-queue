import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

/**
 * Generate next queue number for barber on specific date (ATOMIC)
 * Uses database transaction to prevent race conditions
 */
export async function generateQueueNumber(
  barbershopId: string,
  barberId: string,
  bookingDate: Date
): Promise<number> {
  // Normalize date to midnight
  const dateOnly = new Date(bookingDate);
  dateOnly.setHours(0, 0, 0, 0);

  // Use transaction with serializable isolation level for atomic operation
  const result = await prisma.$transaction(
    async (tx) => {
      // Get max queue number for this barber on this date
      const lastBooking = await tx.booking.findFirst({
        where: {
          barbershopId,
          barberId,
          bookingDate: dateOnly,
        },
        orderBy: {
          queueNumber: 'desc',
        },
        select: {
          queueNumber: true,
        },
      });

      const nextQueueNumber = (lastBooking?.queueNumber ?? 0) + 1;

      return nextQueueNumber;
    },
    {
      isolationLevel: 'Serializable', // Prevent race conditions
    }
  );

  return result;
}

/**
 * Create booking with atomic queue number generation
 */
export async function createBooking(data: {
  barbershopId: string;
  barberId: string;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  bookingDate: Date;
}) {
  const { barbershopId, barberId, customerName, customerPhone, customerNotes, bookingDate } =
    data;

  // Normalize date
  const dateOnly = new Date(bookingDate);
  dateOnly.setHours(0, 0, 0, 0);

  // Use transaction to ensure atomicity
  const booking = await prisma.$transaction(
    async (tx) => {
      // Generate queue number
      const lastBooking = await tx.booking.findFirst({
        where: {
          barbershopId,
          barberId,
          bookingDate: dateOnly,
        },
        orderBy: {
          queueNumber: 'desc',
        },
        select: {
          queueNumber: true,
        },
      });

      const queueNumber = (lastBooking?.queueNumber ?? 0) + 1;

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          barbershopId,
          barberId,
          customerName,
          customerPhone,
          customerNotes: customerNotes || null,
          bookingDate: dateOnly,
          queueNumber,
          status: BookingStatus.BOOKED,
        },
        include: {
          barber: {
            include: {
              barberProfile: true,
            },
          },
          barbershop: true,
        },
      });

      return newBooking;
    },
    {
      isolationLevel: 'Serializable',
    }
  );

  return booking;
}

/**
 * Get estimated wait time based on queue position
 * Assume 30 minutes per customer (can be customized)
 */
export function getEstimatedWaitTime(queuePosition: number, avgServiceMinutes = 30): number {
  return queuePosition * avgServiceMinutes;
}

/**
 * Get current queue count for barber on date
 */
export async function getCurrentQueueCount(
  barbershopId: string,
  barberId: string,
  bookingDate: Date
): Promise<number> {
  const dateOnly = new Date(bookingDate);
  dateOnly.setHours(0, 0, 0, 0);

  const count = await prisma.booking.count({
    where: {
      barbershopId,
      barberId,
      bookingDate: dateOnly,
      status: {
        in: [BookingStatus.BOOKED, BookingStatus.CALLING, BookingStatus.CHECKED_IN],
      },
    },
  });

  return count;
}
import { notFound } from 'next/navigation';
import { DayOfWeek } from '@prisma/client';
import prisma from '@/lib/prisma';
import BookingClient from './BookingClient';

export const dynamic = 'force-dynamic';

export default async function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug: slug },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      phone: true,
      timezone: true,
    },
  });

  if (!barbershop) {
    notFound();
  }

  const barbers = await prisma.user.findMany({
    where: {
      barbershopId: barbershop.id,
      role: 'BARBER',
      isActive: true,
      barberProfile: {
        isAvailable: true,
      },
    },
    include: {
      barberProfile: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  const timeZone = barbershop.timezone || 'Asia/Jakarta';
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long',
  });
  const parts = formatter.formatToParts(now);
  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = Number(getPart('hour'));
  const minute = Number(getPart('minute'));
  const weekday = getPart('weekday');

  const weekdayMap: Record<string, DayOfWeek> = {
    Sunday: 'SUNDAY',
    Monday: 'MONDAY',
    Tuesday: 'TUESDAY',
    Wednesday: 'WEDNESDAY',
    Thursday: 'THURSDAY',
    Friday: 'FRIDAY',
    Saturday: 'SATURDAY',
  };
  const dayOfWeek = weekdayMap[weekday] ?? 'SUNDAY';

  const bookingDate = `${year}-${month}-${day}`;
  const today = new Date(`${bookingDate}T00:00:00.000Z`);

  const todayHours = await prisma.operatingHours.findFirst({
    where: {
      barbershopId: barbershop.id,
      dayOfWeek,
    },
    select: {
      isOpen: true,
      openTime: true,
      closeTime: true,
    },
  });

  const queueItems = await prisma.booking.findMany({
    where: {
      barbershopId: barbershop.id,
      bookingDate: today,
      status: {
        in: ['BOOKED', 'CALLING', 'IN_PROGRESS'],
      },
    },
    orderBy: { queueNumber: 'asc' },
    select: {
      queueNumber: true,
      status: true,
    },
  });

  const currentTime = hour * 60 + minute;
  let isOpen = false;

  if (todayHours?.isOpen && todayHours.openTime && todayHours.closeTime) {
    const [openHour, openMin] = todayHours.openTime.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.closeTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    isOpen = currentTime >= openMinutes && currentTime < closeMinutes;
  }

  return (
    <BookingClient
      barbershop={barbershop}
      queueItems={queueItems}
      isOpen={isOpen}
      barbers={barbers.map((barber) => ({
        id: barber.id,
        name: barber.name,
        displayName: barber.barberProfile?.displayName ?? null,
      }))}
      bookingDate={bookingDate}
    />
  );
}

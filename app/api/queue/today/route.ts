import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

function getTodayDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedBarbershopId = searchParams.get('barbershopId');
  const user = await getCurrentUser();

  let barbershopId = requestedBarbershopId ?? user?.barbershopId ?? null;

  if (!barbershopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (requestedBarbershopId && user && user.role !== 'SUPER_ADMIN') {
    if (user.barbershopId !== requestedBarbershopId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const today = getTodayDate();

  const bookings = await prisma.booking.findMany({
    where: {
      barbershopId,
      bookingDate: today,
    },
    include: {
      barber: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      queueNumber: 'asc',
    },
  });

  const items = bookings.map((booking) => ({
    id: booking.id,
    queueNumber: booking.queueNumber,
    customerName: user ? booking.customerName : `Pelanggan ${booking.queueNumber}`,
    customerPhone: user ? booking.customerPhone : '',
    status: booking.status,
    estimatedDuration: booking.estimatedDurationMinutes,
    bookingType: 'BOOKING',
    createdAt: booking.createdAt.toISOString(),
    barber: {
      id: booking.barber.id,
      name: booking.barber.name,
    },
  }));

  return NextResponse.json({ items, barbershopId });
}

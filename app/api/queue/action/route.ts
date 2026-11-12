import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';
import { broadcast } from '@/lib/sse-manager';
import type { QueueActionPayload } from '@/types';

export const dynamic = 'force-dynamic';

const ACTION_STATUS_MAP = {
  CALL: 'CALLING',
  START: 'IN_PROGRESS',
  DONE: 'DONE',
  NO_SHOW: 'NO_SHOW',
} as const;

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = (await request.json()) as QueueActionPayload;
  const { bookingId, action } = payload;

  if (!bookingId || !action || !(action in ACTION_STATUS_MAP)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, barbershopId: true, barberId: true },
  });

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (user.role !== 'SUPER_ADMIN') {
    if (!user.barbershopId || booking.barbershopId !== user.barbershopId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  if (user.role === 'BARBER' && booking.barberId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const now = new Date();
  const status = ACTION_STATUS_MAP[action];

  const data: Record<string, unknown> = {
    status,
  };

  if (action === 'CALL') {
    data.calledAt = now;
  }

  if (action === 'START') {
    data.inProgressAt = now;
  }

  if (action === 'DONE') {
    data.completedAt = now;
  }

  if (action === 'NO_SHOW') {
    data.cancelledAt = now;
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data,
  });

  broadcast(booking.barbershopId, 'queue:update', {
    bookingId: updated.id,
    status: updated.status,
  });

  return NextResponse.json({ item: updated });
}

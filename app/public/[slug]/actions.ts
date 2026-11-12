'use server';

import { redirect } from 'next/navigation';
import { validateBooking } from '@/lib/validation';
import { createBooking } from '@/lib/booking';
import prisma from '@/lib/prisma';

export async function submitBooking(slug: string, formData: FormData) {
  const barberId = formData.get('barberId') as string;
  const bookingDate = formData.get('bookingDate') as string;
  const customerName = formData.get('customerName') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const customerNotes = formData.get('customerNotes') as string;

  // Validate inputs
  if (!barberId || !bookingDate || !customerName || !customerPhone) {
    throw new Error('Required fields missing');
  }

  // Get barbershop by slug
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug },
  });

  if (!barbershop || !barbershop.isActive) {
    throw new Error('Barbershop not found or inactive');
  }

  // Parse date
  const parsedDate = new Date(bookingDate);

  // Validate booking
  const validation = await validateBooking(barbershop.id, barberId, parsedDate);

  if (!validation.valid) {
    throw new Error(validation.error || 'Booking validation failed');
  }

  // Create booking
  const booking = await createBooking({
    barbershopId: barbershop.id,
    barberId,
    customerName,
    customerPhone,
    customerNotes,
    bookingDate: parsedDate,
  });

  // Redirect to success page
  redirect(`/public/${slug}/success?bookingId=${booking.id}`);
}

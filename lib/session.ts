import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { createSessionToken, verifySessionToken, SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from '@/lib/session-token';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = await verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId }, include: { barbershop: true },
  });
  return user?.isActive ? user : null;
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', path: '/',
    secure: process.env.NODE_ENV === 'production', maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

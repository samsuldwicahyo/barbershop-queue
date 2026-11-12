'use server';

import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { setSessionCookie } from '@/lib/session';
import { redirect } from 'next/navigation';

export type LoginState = {
  error?: string;
};

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive || !user.passwordHash) {
    return { error: 'Email atau password salah.' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Email atau password salah.' };
  }

  await setSessionCookie(user.id);
  redirect('/dashboard');
}

export async function login(formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive || !user.passwordHash) {
    return { error: 'Email atau password salah.' };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: 'Email atau password salah.' };
  }

  await setSessionCookie(user.id);
  return {};
}

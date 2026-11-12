import 'dotenv/config';
import { UserRole } from '@prisma/client';
import prisma from '../lib/prisma';
import { hashPassword } from '../lib/auth';

function credentials(email: string | undefined, password: string | undefined) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
    throw new Error('Provide a valid bootstrap email and a password of at least 12 characters.');
  }
  return { email: email.trim().toLowerCase(), password };
}

async function main() {
  const name = process.env.SHOP_NAME?.trim();
  const slug = process.env.SHOP_SLUG?.trim();
  if (!name || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Set SHOP_NAME and a lowercase URL-safe SHOP_SLUG.');
  }
  const owner = credentials(process.env.SHOP_ADMIN_EMAIL, process.env.SHOP_ADMIN_PASSWORD);
  const superadmin = process.env.SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_PASSWORD
    ? credentials(process.env.SUPER_ADMIN_EMAIL, process.env.SUPER_ADMIN_PASSWORD) : null;
  await prisma.$transaction(async (tx) => {
    const shop = await tx.barbershop.upsert({ where: { slug }, update: {}, create: { name, slug } });
    const existing = await tx.user.findUnique({ where: { email: owner.email } });
    if (existing && (existing.role !== UserRole.SHOP_ADMIN || existing.barbershopId !== shop.id)) {
      throw new Error('Bootstrap email already belongs to another tenant or role.');
    }
    if (!existing) await tx.user.create({ data: {
      email: owner.email, name: 'Shop Admin', passwordHash: await hashPassword(owner.password),
      role: UserRole.SHOP_ADMIN, barbershopId: shop.id,
    } });
    if (superadmin) {
      const existingAdmin = await tx.user.findUnique({ where: { email: superadmin.email } });
      if (existingAdmin && existingAdmin.role !== UserRole.SUPER_ADMIN) throw new Error('Superadmin email belongs to another role.');
      if (!existingAdmin) await tx.user.create({ data: {
        email: superadmin.email, name: 'Super Admin', passwordHash: await hashPassword(superadmin.password),
        role: UserRole.SUPER_ADMIN,
      } });
    }
  });
  console.log('Bootstrap completed. Existing credentials were not changed.');
}

main().catch(() => {
  console.error('Bootstrap failed. Check local configuration and database access.');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { createBarber } from '../actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

export default async function NewBarberPage() {
  const user = await getCurrentUser();

  if (!user || !user.barbershopId) {
    redirect('/dashboard');
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/dashboard/barbers" className="text-blue-600 hover:underline">
          ← Back to Barbers
        </Link>
      </div>

      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Add New Barber</h2>

        <form action={createBarber} className="bg-white rounded-lg shadow p-6 space-y-4">
          <Input
            label="Email *"
            type="email"
            name="email"
            id="email"
            required
            placeholder="barber@example.com"
          />

          <Input label="Name *" type="text" name="name" id="name" required placeholder="John Doe" />

          <Input
            label="Phone"
            type="tel"
            name="phone"
            id="phone"
            placeholder="+62812345678"
          />

          <Input
            label="Password *"
            type="password"
            name="password"
            id="password"
            required
            placeholder="Minimum 6 characters"
          />

          <hr className="my-6" />

          <h3 className="font-semibold text-lg">Barber Profile</h3>

          <Input
            label="Display Name *"
            type="text"
            name="displayName"
            id="displayName"
            required
            placeholder="John 'The Clipper' Doe"
          />

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Specialist in classic cuts and beard styling..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">Create Barber</Button>
            <Link href="/dashboard/barbers">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="grid gap-4 max-w-2xl">
        <Link href="/dashboard/settings/operating-hours">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">🕐 Operating Hours</h3>
            <p className="text-sm text-slate-600">Manage your shop's opening hours per day</p>
          </div>
        </Link>

        <Link href="/dashboard/settings/holidays">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-lg font-semibold mb-2">📅 Holidays</h3>
            <p className="text-sm text-slate-600">Set special closing dates</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
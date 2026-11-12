'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Barber {
  id: string;
  name: string;
  displayName: string;
  bio: string | null;
  isAvailable: boolean;
}

interface BookingFormProps {
  slug: string;
  barbers: Barber[];
  submitAction: (slug: string, formData: FormData) => Promise<void>;
}

export default function BookingForm({ slug, barbers, submitAction }: BookingFormProps) {
  const [selectedBarber, setSelectedBarber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get min date (today)
  const today = new Date().toISOString().split('T')[0];

  // Get max date (30 days from now)
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await submitAction(slug, formData);
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Select Barber */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Select Barber *
        </label>
        <div className="grid gap-3">
          {barbers.map((barber) => (
            <label
              key={barber.id}
              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                selectedBarber === barber.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              } ${!barber.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input
                type="radio"
                name="barberId"
                value={barber.id}
                required
                disabled={!barber.isAvailable}
                checked={selectedBarber === barber.id}
                onChange={(e) => setSelectedBarber(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{barber.displayName}</p>
                  {!barber.isAvailable && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Unavailable
                    </span>
                  )}
                </div>
                {barber.bio && <p className="text-sm text-slate-600 mt-1">{barber.bio}</p>}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Booking Date */}
      <Input
        label="Booking Date *"
        type="date"
        name="bookingDate"
        id="bookingDate"
        required
        min={today}
        max={maxDateStr}
      />

      {/* Customer Name */}
      <Input
        label="Your Name *"
        type="text"
        name="customerName"
        id="customerName"
        required
        placeholder="John Doe"
      />

      {/* Customer Phone (WhatsApp) */}
      <Input
        label="WhatsApp Number *"
        type="tel"
        name="customerPhone"
        id="customerPhone"
        required
        placeholder="+62812345678"
      />

      {/* Customer Notes */}
      <div>
        <label htmlFor="customerNotes" className="block text-sm font-medium text-slate-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          name="customerNotes"
          id="customerNotes"
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any special requests or notes..."
        />
      </div>

      {/* Submit */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Processing...' : 'Book Appointment'}
      </Button>

      <p className="text-xs text-slate-600 text-center">
        By booking, you agree to receive WhatsApp notifications about your queue status.
      </p>
    </form>
  );
}
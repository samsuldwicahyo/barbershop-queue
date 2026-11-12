'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useQueueStream } from '@/hooks/useQueueStream';
import type { QueueActionPayload } from '@/types';

type CurrentUser = {
  id: string;
  role: string;
  barbershopId: string | null;
} | null;

const STATUS_LABELS: Record<string, string> = {
  BOOKED: 'Booked',
  CALLING: 'Calling',
  CHECKED_IN: 'Checked In',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CANCELLED_BY_CUSTOMER: 'Cancelled (Customer)',
  CANCELLED_BY_SHOP: 'Cancelled (Shop)',
  NO_SHOW: 'No Show',
};

export default function QueueDashboardPage() {
  const { queue, status, error, refresh } = useQueueStream();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  useEffect(() => {
    let active = true;

    async function loadMe() {
      try {
        const response = await fetch('/api/me', { cache: 'no-store' });
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as { user: CurrentUser };
        if (active) {
          setCurrentUser(data.user ?? null);
        }
      } catch {
        if (active) {
          setCurrentUser(null);
        }
      }
    }

    loadMe();

    return () => {
      active = false;
    };
  }, []);

  async function handleAction(payload: QueueActionPayload) {
    try {
      setActionError(null);
      setActionLoading(payload.bookingId + payload.action);

      const response = await fetch('/api/queue/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to update queue');
      }

      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update queue');
    } finally {
      setActionLoading(null);
    }
  }

  const canActOn = (barberId: string) => {
    if (!currentUser) {
      return false;
    }
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SHOP_ADMIN') {
      return true;
    }
    if (currentUser.role === 'BARBER') {
      return currentUser.id === barberId;
    }
    return false;
  };

  const statusBadge =
    status === 'connected'
      ? 'bg-green-50 text-green-700 border-green-200'
      : status === 'loading'
      ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
      : status === 'error'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-slate-50 text-slate-600 border-slate-200';

  const statusLabel =
    status === 'connected'
      ? 'Connected'
      : status === 'loading'
      ? 'Connecting...'
      : status === 'error'
      ? 'Disconnected'
      : 'Idle';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Queue Today</h1>
          <p className="text-sm text-slate-600">Realtime queue updates for your barbershop.</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge}`}
          >
            {statusLabel}
          </span>
          <Button variant="secondary" onClick={refresh} disabled={status === 'loading'}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
          <div className="col-span-1">No</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-3">Barber</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {queue.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500">No queue today.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((item) => {
              const loadingKey = item.id + 'CALL';
              const loadingStartKey = item.id + 'START';
              const loadingDoneKey = item.id + 'DONE';
              const loadingNoShowKey = item.id + 'NO_SHOW';

              const canAct = canActOn(item.barber.id);

              return (
                <div key={item.id} className="grid grid-cols-12 gap-4 px-4 py-4 text-sm">
                  <div className="col-span-1 font-semibold">{item.queueNumber}</div>
                  <div className="col-span-3">
                    <p className="font-medium text-slate-900">{item.customerName}</p>
                    <p className="text-xs text-slate-500">{item.customerPhone ?? '-'}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="font-medium text-slate-900">{item.barber.name}</p>
                    <p className="text-xs text-slate-500">ID: {item.barber.id}</p>
                  </div>
                  <div className="col-span-2 text-sm text-slate-700">
                    {STATUS_LABELS[item.status] ?? item.status}
                  </div>
                  <div className="col-span-3 flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      disabled={
                        !canAct || item.status !== 'BOOKED' || actionLoading === loadingKey
                      }
                      onClick={() => handleAction({ bookingId: item.id, action: 'CALL' })}
                    >
                      Call
                    </Button>
                    <Button
                      variant="primary"
                      disabled={
                        !canAct ||
                        (item.status !== 'CALLING' && item.status !== 'CHECKED_IN') ||
                        actionLoading === loadingStartKey
                      }
                      onClick={() => handleAction({ bookingId: item.id, action: 'START' })}
                    >
                      Start
                    </Button>
                    <Button
                      variant="primary"
                      disabled={
                        !canAct || item.status !== 'IN_PROGRESS' || actionLoading === loadingDoneKey
                      }
                      onClick={() => handleAction({ bookingId: item.id, action: 'DONE' })}
                    >
                      Done
                    </Button>
                    <Button
                      variant="danger"
                      disabled={
                        !canAct || item.status !== 'CALLING' || actionLoading === loadingNoShowKey
                      }
                      onClick={() => handleAction({ bookingId: item.id, action: 'NO_SHOW' })}
                    >
                      No-show
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

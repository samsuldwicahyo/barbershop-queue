import { useCallback, useEffect, useMemo, useState } from 'react';
import type { QueueItem } from '@/types';

export type QueueStreamStatus = 'idle' | 'loading' | 'connected' | 'error';

export type UseQueueStreamOptions = {
  barbershopId?: string;
};

export function useQueueStream(options: UseQueueStreamOptions | string | null = {}) {
  const resolvedOptions =
    typeof options === 'string' ? { barbershopId: options } : options ?? {};
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [status, setStatus] = useState<QueueStreamStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    if (!resolvedOptions.barbershopId) {
      return '';
    }
    return `?barbershopId=${encodeURIComponent(resolvedOptions.barbershopId)}`;
  }, [resolvedOptions.barbershopId]);

  const fetchQueue = useCallback(async () => {
    try {
      setStatus('loading');
      const response = await fetch(`/api/queue/today${queryString}`, { cache: 'no-store' });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to load queue');
      }
      const data = (await response.json()) as { items: QueueItem[] };
      setQueue(data.items ?? []);
      setStatus('connected');
      setError(null);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    }
  }, [queryString]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/queue/stream${queryString}`);

    const handleUpdate = () => {
      fetchQueue();
    };

    eventSource.addEventListener('queue:update', handleUpdate);

    eventSource.addEventListener('connected', () => {
      setStatus('connected');
    });

    eventSource.onerror = () => {
      setStatus('error');
      setError('Koneksi realtime terputus');
    };

    return () => {
      eventSource.close();
    };
  }, [fetchQueue, queryString]);

  return {
    queue,
    status,
    isConnected: status === 'connected',
    error,
    refresh: fetchQueue,
  };
}

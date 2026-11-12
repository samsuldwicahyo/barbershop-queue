import { NextResponse } from 'next/server';
import { addClient } from '@/lib/sse-manager';
import { getCurrentUser } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const encoder = new TextEncoder();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedBarbershopId = searchParams.get('barbershopId');
  const user = await getCurrentUser();

  let barbershopId = requestedBarbershopId ?? user?.barbershopId ?? null;

  if (!barbershopId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (requestedBarbershopId && user && user.role !== 'SUPER_ADMIN') {
    if (user.barbershopId !== requestedBarbershopId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  let removeClient = () => {};
  let pingInterval: NodeJS.Timeout | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      removeClient = addClient(barbershopId, controller);
      controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));

      pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'));
        } catch {
          removeClient();
          if (pingInterval) {
            clearInterval(pingInterval);
          }
        }
      }, 25000);

      request.signal.addEventListener('abort', () => {
        removeClient();
        if (pingInterval) {
          clearInterval(pingInterval);
        }
      });
    },
    cancel() {
      removeClient();
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

const encoder = new TextEncoder();

type SSEController = ReadableStreamDefaultController<Uint8Array>;

type ChannelMap = Map<string, Set<SSEController>>;

const globalForSse = globalThis as unknown as {
  queueSseChannels?: ChannelMap;
};

const channels: ChannelMap = globalForSse.queueSseChannels ?? new Map();

if (!globalForSse.queueSseChannels) {
  globalForSse.queueSseChannels = channels;
}

function formatEvent(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function addClient(barbershopId: string, controller: SSEController) {
  const channel = channels.get(barbershopId) ?? new Set();
  channel.add(controller);
  channels.set(barbershopId, channel);

  return () => {
    channel.delete(controller);
    if (channel.size === 0) {
      channels.delete(barbershopId);
    }
  };
}

export function broadcast(barbershopId: string, event: string, data: unknown) {
  const channel = channels.get(barbershopId);
  if (!channel || channel.size === 0) {
    return 0;
  }

  const payload = formatEvent(event, data);
  let sent = 0;

  for (const controller of channel) {
    try {
      controller.enqueue(encoder.encode(payload));
      sent += 1;
    } catch {
      channel.delete(controller);
    }
  }

  if (channel.size === 0) {
    channels.delete(barbershopId);
  }

  return sent;
}

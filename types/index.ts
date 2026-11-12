// Queue Types
export interface QueueItem {
  id: string;
  queueNumber: number;
  customerName: string;
  customerPhone: string | null;
  status: string;
  estimatedDuration: number | null;
  bookingType: string;
  createdAt: string;
  barber: {
    id: string;
    name: string;
  };
}

export interface QueueActionPayload {
  bookingId: string;
  action: 'CALL' | 'START' | 'DONE' | 'NO_SHOW';
}

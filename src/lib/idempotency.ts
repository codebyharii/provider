import { prisma } from './prisma';

export async function checkIdempotency(eventId: string, type: string): Promise<boolean> {
  const existing = await prisma.webhookEvent.findUnique({
    where: { id: eventId }
  });

  if (existing) {
    return true; // Already processed
  }

  return false; // Not processed
}

export async function logWebhookEvent(eventId: string, type: string) {
  await prisma.webhookEvent.create({
    data: {
      id: eventId,
      type
    }
  });
}

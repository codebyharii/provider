import { prisma } from './prisma';

export async function checkIdempotency(eventId: string): Promise<boolean> {
  const existing = await prisma.webhookEvent.findUnique({
    where: { id: eventId }
  });

  if (existing) {
    return true; // Already processed
  }

  return false; // Not processed
}

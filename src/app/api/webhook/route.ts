import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkIdempotency } from '@/lib/idempotency';
import { webhookSchema } from '@/lib/validators';
import { sseManager } from '@/lib/sse';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = webhookSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues }, { status: 400 });
    }

    const { event_id } = result.data;

    // 1. Check idempotency
    const isProcessed = await checkIdempotency(event_id);
    if (isProcessed) {
      return NextResponse.json({ message: "Already processed" }, { status: 200 });
    }

    // 2. Process webhook inside transaction
    try {
      await prisma.$transaction(async (tx) => {
        // Reset all providers' leadsReceived to 0
        await tx.provider.updateMany({
          data: { leadsReceived: 0 }
        });

        // Log the webhook event
        await tx.webhookEvent.create({
          data: { id: event_id, type: result.data.type }
        });
      });
    } catch (error) {
      // Catch duplicate key/unique constraint violation (P2002) for idempotency
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
        return NextResponse.json({ message: "Already processed" }, { status: 200 });
      }
      throw error;
    }

    // Broadcast reset via SSE
    sseManager.broadcast({
      type: 'QUOTA_RESET',
      eventId: event_id
    });

    return NextResponse.json({ success: true, message: "Quotas reset successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

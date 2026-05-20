import { sseManager } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = Math.random().toString(36).substring(7);

  const stream = new ReadableStream({
    start(controller) {
      sseManager.addClient({ id: clientId, controller });

      // Send initial heartbeat
      controller.enqueue(new TextEncoder().encode(`data: {"type": "CONNECTED"}\n\n`));
    },
    cancel() {
      sseManager.removeClient(clientId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

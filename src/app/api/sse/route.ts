import { NextRequest } from 'next/server';
import { sseManager } from '@/lib/sse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  let controllerRef: ReadableStreamDefaultController | null = null;
  const clientId = Math.random().toString(36).substring(7);

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
      sseManager.addClient({ id: clientId, controller });

      // Send initial heartbeat
      controller.enqueue(new TextEncoder().encode(`data: {"type": "CONNECTED"}\n\n`));
    },
    cancel() {
      if (controllerRef) {
        sseManager.removeClient({ id: clientId, controller: controllerRef });
      }
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

"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

export function TestPanel() {
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [eventId, setEventId] = useState('evt_' + Math.random().toString(36).substring(7));

  function appendLog(msg: string) {
    setLog(prev => [msg, ...prev].slice(0, 5));
  }

  async function triggerQuotaReset() {
    setLoading(true);
    try {
      const res = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer secret123'
        },
        body: JSON.stringify({
          event_id: eventId,
          type: 'quota_reset'
        })
      });
      const data = await res.json();
      appendLog(`Webhook [${eventId}]: ${res.status} - ${JSON.stringify(data)}`);
    } catch (err: any) {
      appendLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Test Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 border-b border-soft pb-6">
          <h4 className="text-sm font-semibold text-primary">Webhook Idempotency Test</h4>
          <p className="text-xs text-muted">Submit multiple times to verify the quota resets only once for the same Event ID.</p>
          <div className="flex gap-2">
            <Input 
              value={eventId} 
              onChange={(e) => setEventId(e.target.value)} 
              placeholder="Event ID"
              className="font-mono text-xs"
            />
            <Button onClick={() => setEventId('evt_' + Math.random().toString(36).substring(7))} variant="outline" size="sm">
              New ID
            </Button>
          </div>
          <Button onClick={triggerQuotaReset} disabled={loading} className="w-full">
            Trigger Webhook (Quota Reset)
          </Button>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-primary">Event Log</h4>
          <div className="bg-surface rounded-md p-3 font-mono text-xs space-y-1 h-32 overflow-y-auto border border-soft">
            {log.length === 0 && <span className="text-muted">No events yet</span>}
            {log.map((msg, i) => (
              <div key={i} className="text-dark">{msg}</div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { TestPanel } from '@/components/TestPanel';

export default function TestToolsPage() {
  return (
    <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold text-primary">Test Tools</h1>
        <p className="text-muted">Simulate webhooks and verify idempotency.</p>
      </div>
      <TestPanel />
    </main>
  );
}

import { DashboardGrid } from '@/components/DashboardGrid';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-surface p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end border-b border-soft pb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-primary">Provider Dashboard</h1>
            <p className="text-muted mt-1">Real-time fair allocation monitor.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </span>
            <span className="text-xs font-semibold text-success">Live SSE</span>
          </div>
        </div>
        
        <DashboardGrid />
      </div>
    </main>
  );
}

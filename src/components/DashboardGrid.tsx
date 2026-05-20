"use client";

import { useEffect, useState } from 'react';
import { ProviderCard } from './ProviderCard';
import { Spinner } from './ui/Spinner';
import { ProviderWithAssignments } from '@/types';

export function DashboardGrid() {
  const [providers, setProviders] = useState<ProviderWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from server');
      }

      setProviders(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();

    const eventSource = new EventSource('/api/sse');
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_LEAD' || data.type === 'QUOTA_RESET') {
        fetchDashboard(); // Refresh data on event
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  if (loading) return <div className="py-20"><Spinner /></div>;

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/30 text-danger p-6 rounded-lg max-w-2xl">
        <h3 className="font-bold mb-2">Database Connection Error</h3>
        <p className="text-sm">{error}</p>
        <p className="text-sm mt-4">
          Please ensure your PostgreSQL database is running and you have executed:
          <br/>
          <code className="bg-white/50 px-2 py-1 rounded mt-2 block font-mono">npx prisma db push && npm run prisma:seed</code>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {providers.map((p) => (
        <ProviderCard key={p.id} provider={p} />
      ))}
    </div>
  );
}

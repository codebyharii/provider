import { LeadForm } from '@/components/LeadForm';

export default function RequestServicePage() {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-primary">Prowider</h1>
          <p className="text-muted">Find the right service provider for your needs.</p>
        </div>
        <LeadForm />
      </div>
    </main>
  );
}

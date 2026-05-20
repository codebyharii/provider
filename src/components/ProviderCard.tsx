import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { QuotaBar } from './QuotaBar';
import { LeadTable } from './LeadTable';
import { ProviderWithAssignments } from '@/types';

export function ProviderCard({ provider }: { provider: ProviderWithAssignments }) {
  const isFull = provider.leadsReceived >= provider.monthlyQuota;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{provider.name}</CardTitle>
        <Badge variant={isFull ? 'danger' : 'success'}>
          {isFull ? 'Quota Full' : 'Active'}
        </Badge>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mt-4 mb-6">
          <QuotaBar received={provider.leadsReceived} total={provider.monthlyQuota} />
        </div>
        
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-primary">Recent Leads</h4>
          <LeadTable assignments={provider.assignments} />
        </div>
      </CardContent>
    </Card>
  );
}

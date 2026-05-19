import { Badge } from './ui/Badge';

export function LeadTable({ assignments }: { assignments: any[] }) {
  if (!assignments || assignments.length === 0) {
    return <p className="text-xs text-muted">No leads assigned yet.</p>;
  }

  return (
    <div className="space-y-2">
      {assignments.map((a: any) => (
        <div key={a.id} className="flex justify-between items-center bg-surface p-2 rounded border border-soft/50 text-xs">
          <div className="flex flex-col">
            <span className="font-semibold text-dark">{a.lead.name}</span>
            <span className="text-muted">{a.lead.city}</span>
          </div>
          <Badge variant="muted">{a.lead.service.name}</Badge>
        </div>
      ))}
    </div>
  );
}

import { cn } from './ui/Button';

export function QuotaBar({ received, total }: { received: number; total: number }) {
  const percentage = Math.min((received / total) * 100, 100);
  const isFull = received >= total;

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs font-medium text-muted">
        <span>Quota Usage</span>
        <span className={cn(isFull && "text-danger font-bold")}>
          {received} / {total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-soft">
        <div
          className={cn("h-full transition-all duration-500", isFull ? "bg-danger" : "bg-primary-light")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

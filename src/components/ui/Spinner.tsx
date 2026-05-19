import { HTMLAttributes } from 'react';
import { cn } from './Button';

export function Spinner({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-center items-center", className)} {...props}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

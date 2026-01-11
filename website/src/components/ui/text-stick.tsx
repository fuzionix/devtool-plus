import { cn } from '../../lib/utils';

export const TextStick = ({ width, className }: { width: string, className?: string }) => (
  <div className={cn("h-1.5 rounded-full bg-slate-200/80", width, className)} />
);
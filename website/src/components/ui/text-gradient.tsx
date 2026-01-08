import React from 'react';
import { cn } from '../../lib/utils';

interface TextGradientProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  to?: string;
}

export default function TextGradient({ 
  children, 
  className, 
  from = "from-slate-900", 
  to = "to-slate-600" 
}: TextGradientProps) {
  return (
    <span 
      className={cn(
        "bg-gradient-to-b bg-clip-text text-transparent pb-1", 
        from, 
        to, 
        className
      )}
    >
      {children}
    </span>
  );
}
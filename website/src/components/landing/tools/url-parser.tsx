import { Link2, Info, X, ArrowDown } from 'lucide-react';
import { TextStick } from '../../ui/text-stick';
import { cn } from '../../../lib/utils';

export default function UrlParser() {
  return (
    <div className="flex flex-col p-4 h-full overflow-y-auto no-scrollbar">
      {/* 1. Tool Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-slate-400" />
          <TextStick width="w-20" className="h-2.5 bg-slate-400" />
        </div>
        <div className="flex gap-2">
          <div className="cursor-pointer rounded p-1 transition-colors hover:bg-slate-100">
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 2. Controls (Toggle Buttons) */}
      <div className="flex rounded-md bg-slate-100/50 mb-2 border border-slate-200/50">
        <div className="flex-1 flex items-center justify-center py-2.5 rounded bg-transparent cursor-pointer hover:bg-slate-200/50 transition-colors">
             <TextStick width="w-16" className="bg-slate-400/60" />
        </div>
        <div className="flex-1 flex items-center justify-center py-2.5 rounded bg-primary-500 cursor-pointer">
             <TextStick width="w-16" className="bg-white/90" />
        </div>
      </div>

      {/* 3. Input Field */}
      <div className="group relative mb-4 flex items-center justify-between rounded-md border border-slate-200 bg-white/50 p-2 pl-3 transition-colors hover:border-primary-200">
        <TextStick width="w-48" className="h-2.5 bg-slate-600" />
        <X className="h-3.5 w-3.5 cursor-pointer text-slate-400 transition-colors hover:text-slate-600" />
      </div>

      {/* 4. Directional Arrow */}
      <div className="flex justify-center mb-2">
         <ArrowDown className="w-4 h-4 text-slate-400 animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      {/* 5. Results Grid (Protocol, Domain, etc.) */}
      <div className="flex flex-col -space-y-px rounded-md">
        <ResultItem labelWidth="w-10" valueWidth="w-8" isFirst />
        <ResultItem labelWidth="w-12" valueWidth="w-24" />
        <ResultItem labelWidth="w-8" valueWidth="w-8" isEmpty />
        <ResultItem labelWidth="w-8" valueWidth="w-4" />
        <ResultItem labelWidth="w-10" valueWidth="w-20" />
        <ResultItem labelWidth="w-14" valueWidth="w-8" isEmpty isLast />
      </div>
    </div>
  );
}

function ResultItem({ 
  labelWidth, 
  valueWidth, 
  isEmpty, 
  isFirst, 
  isLast 
}: { 
  labelWidth: string; 
  valueWidth: string; 
  isEmpty?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  return (
    <div className={cn(
      "flex items-stretch border border-slate-200 bg-white/40",
      isFirst && "rounded-t-md",
      isLast && "rounded-b-md"
    )}>
      {/* Label Column */}
      <div className="flex w-20 items-center justify-end border-r border-slate-200 bg-slate-50/50 px-3 py-2.5">
        <TextStick width={labelWidth} className="h-1.5 bg-slate-400/70" />
      </div>
      
      {/* Value Column */}
      <div className="flex flex-1 items-center px-3 py-2.5">
        <TextStick 
            width={valueWidth} 
            className={cn("h-2", isEmpty ? "bg-slate-200/50" : "bg-slate-700")} 
        />
      </div>
    </div>
  );
}
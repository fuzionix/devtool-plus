import { 
  Hash, 
  Info, 
  ChevronDown, 
  ArrowDown, 
  Copy, 
  FileText, 
  X,
  CircleHelp
} from 'lucide-react';
import { TextStick } from '../../ui/text-stick';

export default function ShaHashing() {
  return (
    <div className="flex flex-col p-4 h-full overflow-y-auto no-scrollbar">
      {/* 1. Tool Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-slate-400" />
          <TextStick width="w-24" className="h-2.5 bg-slate-400" />
        </div>
        <div className="flex gap-2">
          <div className="cursor-pointer rounded p-1 transition-colors hover:bg-slate-100">
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 2. Dropdown Selectors Row */}
      <div className="mb-2 grid grid-cols-2 gap-3">
        {/* Algorithm Selector */}
        <div>
          <TextStick width="w-20" className="mb-2 bg-slate-400/80" />
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-2 pl-3 transition-colors hover:border-slate-300">
            <TextStick width="w-12" className="bg-slate-600" />
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
        
        {/* Format Selector */}
        <div>
          <TextStick width="w-20" className="mb-2 bg-slate-400/80" />
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-2 py-2 pl-3 transition-colors hover:border-slate-300">
            <TextStick width="w-16" className="bg-slate-600" />
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 3. HMAC Checkbox Row */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-3.5 w-3.5 rounded border border-slate-300 bg-white" />
        <TextStick width="w-16" className="bg-slate-500" />
        <CircleHelp className="h-3.5 w-3.5 text-slate-400" />
      </div>

      {/* 4. Input Area */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <TextStick width="w-24" className="bg-slate-500" />
          <div className="flex items-center gap-1">
            <TextStick width="w-8" className="bg-slate-400/60" />
            <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
          </div>
        </div>
        
        <div className="relative h-16 w-full rounded-md border border-slate-200 bg-white p-2 pl-3 transition-colors focus-within:border-primary-300 hover:border-slate-300">
          <TextStick width="w-32" className="h-2.5 bg-primary-500" />
          
          {/* Action Icons (Top Right) */}
          <div className="absolute right-0.5 top-0.5 flex">
            <div className="cursor-pointer rounded p-1.5 hover:bg-slate-100">
               <FileText className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="cursor-pointer rounded p-1.5 hover:bg-slate-100">
               <X className="h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Directional Arrow */}
      <div className="mb-2 flex justify-center">
         <ArrowDown className="h-4 w-4 animate-bounce text-slate-400" style={{ animationDuration: '3s' }} />
      </div>

      {/* 6. Output Area */}
      <div className="flex flex-col gap-2">
        <div className="relative h-12 w-full rounded-md border border-slate-200 bg-slate-50/50 p-2 pl-3">
          <TextStick width="w-48" className="h-2.5 bg-primary-500/60" />
          
          {/* Copy Icon (Bottom Right) */}
          <div className="absolute bottom-0.5 right-0.5 cursor-pointer rounded p-1.5 transition-colors hover:bg-slate-200/50">
             <Copy className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
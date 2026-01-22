import { 
  Copy, 
  ArrowDown, 
  Info,
  Fingerprint 
} from 'lucide-react';
import { TextStick } from '../../ui/text-stick';

export default function UuidGenerator() {
  return (
    <div className="flex flex-col p-4 h-full overflow-y-auto no-scrollbar">
      {/* 1. Tool Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-slate-400" />
          <TextStick width="w-24" className="h-2.5 bg-slate-400" />
        </div>
        <div className="flex gap-2">
            <div className="p-1 hover:bg-slate-100 rounded cursor-pointer">
                <Info className="w-3.5 h-3.5 text-slate-400" />
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

      {/* 3. Main Action Button */}
      <div className="group w-full h-8 bg-primary-500 hover:bg-primary-600 rounded-md flex items-center justify-center mb-4 cursor-pointer">
        <div className="flex items-center gap-2">
          <TextStick width="w-20" className="bg-white/90" />
        </div>
      </div>

      {/* 4. Directional Arrow */}
      <div className="flex justify-center mb-2">
         <ArrowDown className="w-4 h-4 text-slate-400 animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      {/* 5. Output Result Box */}
      <div className="relative flex items-center justify-between p-0.5 pl-3 border border-slate-200 bg-white/50 rounded-md mb-2 group hover:border-primary-200 transition-colors">
        <div className="flex items-center gap-2">
            <TextStick width="w-36" className="bg-slate-600 h-2.5" />
        </div>
        <div className="p-1.5 rounded hover:bg-slate-100 cursor-pointer transition-colors">
            <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary-500" />
        </div>
      </div>

      {/* 6. Footer Controls */}
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 border border-slate-300 rounded bg-white cursor-pointer hover:border-primary-400 transition-colors" />
        <TextStick width="w-16" />
      </div>
    </div>
  );
}
import { 
  PaintbrushVertical, 
  Info, 
  Copy, 
  ArrowDown, 
  Moon 
} from 'lucide-react';
import { TextStick } from '../../ui/text-stick';

export default function ColorFormat() {
  return (
    <div className="flex flex-col p-4 h-full overflow-y-auto no-scrollbar">
      {/* 1. Tool Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PaintbrushVertical className="h-4 w-4 text-slate-400" />
          <TextStick width="w-24" className="h-2.5 bg-slate-400" />
        </div>
        <div className="flex gap-2">
          <div className="cursor-pointer rounded p-1 transition-colors hover:bg-slate-100">
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* 3. Color Picker Area */}
      <div className="mb-2">
        {/* The Color Bar */}
        <div className="relative mb-2 flex h-8 w-full items-center rounded bg-primary-500 px-3 shadow-sm transition-transform">
            <Moon className="h-4 w-4 text-white/90" />
        </div>
        
        {/* "Pick your color here" Label + Arrow */}
        <div className="flex flex-col items-center">
            <TextStick width="w-32" className="h-2 mb-4 bg-slate-300" />
            <ArrowDown className="h-4 w-4 animate-bounce text-slate-400" style={{ animationDuration: '3s' }} />
        </div>
      </div>

      {/* 4. Input Fields List */}
      <div className="flex flex-col gap-1.5 pb-4">
        <InputRow labelWidth="w-8" valueWidth="w-20" />   {/* HEX */}
        <InputRow labelWidth="w-6" valueWidth="w-32" />   {/* RGB */}
        <InputRow labelWidth="w-8" valueWidth="w-32" />   {/* HSL */}
        <InputRow labelWidth="w-8" valueWidth="w-28" />   {/* HWB */}
        <InputRow labelWidth="w-4" valueWidth="w-24" />   {/* CMYK */}
        <InputRow labelWidth="w-6" valueWidth="w-32" />   {/* LCH */}
      </div>
    </div>
  );
}

function InputRow({ labelWidth, valueWidth }: { labelWidth: string, valueWidth: string }) {
    return (
        <div className="flex items-center gap-3">
            {/* Label Column (Right Aligned) */}
            <div className="flex w-10 justify-end">
                <TextStick width={labelWidth} className="h-1.5 bg-slate-400" />
            </div>

            {/* Input Box */}
            <div className="group flex flex-1 items-center justify-between rounded-md border border-slate-200 bg-white/50 p-0.5 pl-3 transition-colors hover:border-primary-200">
                <div className="flex items-center gap-2">
                    <TextStick width={valueWidth} className="h-2 bg-slate-600" />
                </div>
                
                {/* Copy Button */}
                <div className="cursor-pointer rounded p-1.5 transition-colors hover:bg-slate-100">
                    <Copy className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-primary-500" />
                </div>
            </div>
        </div>
    );
}
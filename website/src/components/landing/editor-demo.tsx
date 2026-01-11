import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Command, 
  Settings, 
  GitGraph, 
  Files, 
  MoreHorizontal,
  Fingerprint,
  Hash,
  Link2,
  Maximize2,
  PaintbrushVertical,
  CirclePlus
} from 'lucide-react';
import { cn } from '../../lib/utils';

import UuidGenerator from './tools/uuid-generator';
import UrlParser from './tools/url-parser';
import ShaHashing from './tools/sha-hashing';
import ColorFormat from './tools/color-format';

// 1. The "Code Stick" - simulates syntax highlighted text
const CodeStick = ({ width, color = "bg-slate-200" }: { width: string, color?: string }) => (
  <div className={cn("h-2.5 rounded-full opacity-80", width, color)} />
);

// 2. A simulated line of code
const CodeLine = ({ lineNo, indent = 0, sticks }: { lineNo: number, indent?: number, sticks: React.ReactNode }) => (
  <div className="flex items-center gap-6 py-1 hover:bg-slate-50/50 transition-colors group">
    <span className="w-4 text-right font-mono text-xs text-slate-300 select-none group-hover:text-slate-400">
      {lineNo}
    </span>
    <div className="flex items-center gap-2" style={{ paddingLeft: `${indent * 1.5}rem` }}>
      {sticks}
    </div>
  </div>
);

export default function EditorDemo() {
  const [activeTool, setActiveTool] = useState<'uuid' | 'url' | 'sha' | 'color'>('uuid');

  const tools = [
    { id: 'uuid', label: 'UUID Gen', icon: Fingerprint },
    { id: 'url', label: 'URL Parser', icon: Link2 },
    { id: 'sha', label: 'SHA Hashing', icon: Hash },
    { id: 'color', label: 'Color Format', icon: PaintbrushVertical },
  ] as const;

  return (
    <section className="relative z-20 mx-auto mt-[80px] w-full max-w-7xl px-8 pb-20">
      {/* Tool Selector Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        className="mb-6 flex justify-center gap-2"
      >
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/50 p-1 backdrop-blur-md shadow-sm">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200",
                  isActive 
                    ? "bg-slate-900 text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tool.label}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white/50 p-1 backdrop-blur-md shadow-sm">
          <button
            className={cn("flex items-center gap-2 rounded-full px-1.5 py-1.5 text-xs font-medium transition-all duration-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900")}
          >
            <CirclePlus className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* 3D Perspective Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 100, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        className="relative mx-auto rounded-lg bg-white/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10"
        style={{ outline: '8px solid rgba(200, 200, 200, 0.25)' }}
      >
        {/* Window Header (macOS style) */}
        <div className="flex h-8 items-center justify-between border-b border-slate-200/60 bg-white/50 px-4 backdrop-blur-md rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-[#28C840] shadow-sm" />
          </div>
          <div className="flex items-center gap-2 rounded-md bg-slate-100/50 px-3 py-1 text-xs font-medium text-slate-500">
            <Command className="h-3 w-3" />
            <span>DevTool+</span>
          </div>
          <div className="w-14" /> {/* Spacer for centering */}
        </div>

        {/* Main Editor Body */}
        <div className="flex h-[640px] w-full overflow-hidden rounded-b-lg bg-white/40">
          
          {/* 1. Activity Bar (Left Vertical Strip) */}
          <div className="hidden flex-col items-center gap-6 border-r border-slate-200/60 bg-slate-50/50 py-4 sm:flex w-12">
            <Files className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" />
            <Search className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" />
            <GitGraph className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" />
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-bold-cross-rounded">
                <path d="M15 15L9 9V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4"/>
                <path d="M9 9v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h4z"/>
                <path d="M9 15h6v4a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4z"/>
              </svg>
            </div>
            <div className="mt-auto flex flex-col gap-6">
              <Settings className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" />
            </div>
          </div>

          {/* 2. Side Menu (The "DevTool+" Panel) */}
          <div className="flex w-full flex-col border-r border-slate-200/60 bg-white/60 sm:w-72">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-xs font-medium uppercase text-slate-500">DevTool+</span>
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </div>

            {/* Search Input Simulation */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <div className="h-2 w-24 rounded-full bg-slate-200" />
              </div>
            </div>

            {/* Dynamic Tool Content */}
            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTool}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTool === 'uuid' && <UuidGenerator />}
                  {activeTool === 'url' && <UrlParser />}
                  {activeTool === 'sha' && <ShaHashing />}
                  {activeTool === 'color' && <ColorFormat />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Info Section */}
            <div className="border-t border-slate-200/60 bg-slate-50/30 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-[10px] font-bold text-primary-600">
                    35
                  </div>
                  <span className="text-xs text-slate-600">Tools Available</span>
                </div>
                <Maximize2 className="h-3 w-3 text-slate-400" />
              </div>
            </div>
          </div>

          {/* 3. Editor Area (Hidden on Mobile) */}
          <div className="hidden flex-1 flex-col bg-white/80 md:flex">
            {/* Editor Tabs */}
            <div className="flex h-8 items-end border-b border-slate-100 bg-slate-50/30">
              <div className="flex h-full items-center gap-2 bg-white px-3 shadow-sm ring-1 ring-slate-200/50">
                <div className="h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-xs font-medium text-slate-600">demo.tsx</span>
              </div>
              <div className="flex h-full items-center gap-2 bg-white px-3 shadow-sm ring-1 ring-slate-200/50">
                <div className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="text-xs font-medium text-slate-600">devtoolplus.html</span>
              </div>
            </div>

            {/* Code Area */}
            <div className="flex-1 overflow-hidden p-2">
              <CodeLine lineNo={1} sticks={<><CodeStick width="w-12" color="bg-purple-400" /><CodeStick width="w-20" /><CodeStick width="w-8" color="bg-blue-400" /></>} />
              <CodeLine lineNo={2} sticks={<><CodeStick width="w-24" color="bg-slate-300" /></>} />
              <CodeLine lineNo={3} indent={1} sticks={<><CodeStick width="w-16" color="bg-blue-400" /><CodeStick width="w-32" /></>} />
              <CodeLine lineNo={4} indent={1} sticks={<><CodeStick width="w-8" color="bg-purple-400" /><CodeStick width="w-24" /></>} />
              <CodeLine lineNo={5} indent={2} sticks={<><CodeStick width="w-12" color="bg-slate-300" /><CodeStick width="w-20" color="bg-green-400" /></>} />
              <CodeLine lineNo={6} indent={1} sticks={<CodeStick width="w-4" />} />
              <CodeLine lineNo={7} sticks={<CodeStick width="w-4" />} />
              <CodeLine lineNo={8} sticks={<><CodeStick width="w-16" color="bg-purple-400" /><CodeStick width="w-12" /></>} />
              <CodeLine lineNo={9} indent={1} sticks={<><CodeStick width="w-24" /><CodeStick width="w-8" color="bg-blue-400" /></>} />
              <CodeLine lineNo={10} indent={1} sticks={<><CodeStick width="w-32" color="bg-slate-300" /></>} />
              <CodeLine lineNo={11} indent={1} sticks={<><CodeStick width="w-12" color="bg-purple-400" /><CodeStick width="w-16" /></>} />
              <CodeLine lineNo={12} sticks={<CodeStick width="w-4" />} />
            </div>
          </div>

        </div>

        {/* Status Bar */}
        <div className="hidden sm:flex h-6 items-center justify-between rounded-b-lg border-t border-slate-200/60 bg-primary-500 px-3 text-[10px] font-normal text-white">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><GitGraph className="h-3 w-3" /> main*</span>
            <span>0 errors, 0 warnings</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Ln 12, Col 4</span>
            <span>UTF-8</span>
            <span>TypeScript React</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
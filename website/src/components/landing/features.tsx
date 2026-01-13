import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Palette, Search, Lock, WifiOff } from 'lucide-react';
import TextGradient from '../ui/text-gradient';

const SecurityVisual = () => (
  <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100/50">
    <div className="relative flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
      <div className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
      </div>
      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <WifiOff className="h-3.5 w-3.5 text-slate-400" />
        <span>Localhost Only</span>
      </div>
    </div>
  </div>
);

const PerformanceVisual = () => (
  <div className="relative flex h-24 w-full items-end justify-center gap-1 overflow-hidden rounded-lg bg-slate-100/50 px-8 pb-4">
    {[50, 60, 30, 80, 40, 70].map((height, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        whileInView={{ height: `${height}%` }}
        transition={{ duration: 0.5, delay: i * 0.1, ease: "backOut" }}
        className="w-full rounded-t-sm bg-primary-200 opacity-80"
      />
    ))}
    <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-primary-100 bg-primary-50 px-2 py-0.5 text-[10px] font-bold text-primary-600 shadow-sm">
      0ms Latency
    </div>
  </div>
);

const ThemeVisual = () => (
  <div className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-900">
    <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
    <div className="flex flex-col gap-2 w-3/4">
      <div className="h-2 w-1/3 rounded-full bg-slate-700" />
      <div className="h-2 w-full rounded-full bg-slate-800" />
      <div className="h-2 w-2/3 rounded-full bg-slate-800" />
    </div>
    <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 backdrop-blur-[4px] border-l border-white/10 rounded-lg" />
    <div className="absolute bottom-2 right-2 rounded bg-white/10 px-2 py-1 text-[10px] text-white/70 backdrop-blur-md">
      Auto-Theme
    </div>
  </div>
);

const SearchVisual = () => (
  <div className="relative flex h-24 w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg bg-slate-100/50">
    <div className="flex w-3/4 h-8 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
      <Search className="h-3.5 w-3.5 text-slate-400" />
      <div className="h-1.5 w-16 rounded-full bg-slate-100" />
    </div>
  </div>
);

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  visual: Visual,
  delay = 0 
}: { 
  title: string; 
  description: string; 
  icon: any; 
  visual: React.ComponentType;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="group relative overflow-hidden rounded-xl border border-white/60 bg-white/40 p-1 backdrop-blur-md transition-all duration-300 hover:border-primary-200/50 hover:bg-white/60 hover:shadow-glass"
    >
      <div className="flex h-full flex-col rounded-lg border border-slate-100 bg-white/50 p-4 transition-colors group-hover:bg-white/80">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
            <Icon className="h-4 w-4" />
          </div>
          <h4 className="font-semibold text-sm text-slate-900">{title}</h4>
        </div>
        
        {/* Description */}
        <p className="mb-4 text-sm leading-relaxed text-slate-500">
          {description}
        </p>

        {/* Visual Slot */}
        <div className="mt-auto">
          <Visual />
        </div>
      </div>
    </motion.div>
  );
};

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={containerRef} className="relative z-10 w-full py-12">
      <div className="mx-auto max-w-7xl px-8 pb-20">
        <div className="grid grid-cols-1 gap-12 xl:grid-cols-2">
          
          {/* Left Column: Narrative */}
          <div className="relative">
            <div className="top-32 flex flex-col gap-8">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 text-xs font-medium text-primary-700 backdrop-blur-sm"
              >
                <Zap className="h-3 w-3 fill-primary-700" />
                <span>Workflow Optimized</span>
              </motion.div>

              <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                <TextGradient className="from-slate-900 via-slate-800 to-slate-500">
                    Engineered for
                </TextGradient>
                <br />
                <TextGradient className="from-primary-600 via-primary-500 to-primary-400">
                    Privacy & Speed
                </TextGradient>
              </h2>
              
              <p className="max-w-md text-sm text-slate-500 sm:text-base">
                Most online tools require sending your data to a remote server. DevTool+ runs entirely within your editor, ensuring your sensitive data never leaves your machine.
              </p>
            </div>
          </div>

          {/* Right Column: Feature Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FeatureCard
              title="Offline & Secure"
              description="No network requests. No API calls. Your tokens, keys, and data stay strictly on your local machine."
              icon={Lock}
              visual={SecurityVisual}
              delay={0}
            />
            <FeatureCard
              title="Instant Performance"
              description="Built with Lit. Views load only when needed, keeping your editor lightweight and snappy."
              icon={Zap}
              visual={PerformanceVisual}
              delay={0.1}
            />
            <FeatureCard
              title="Theme Aware"
              description="Automatically adapts to your editor's color theme. Looks native in Light, Dark, and High Contrast modes."
              icon={Palette}
              visual={ThemeVisual}
              delay={0.2}
            />
            <FeatureCard
              title="Smart Search"
              description="Find any tool instantly with fuzzy search. Filter by category, tags, or functionality."
              icon={Search}
              visual={SearchVisual}
              delay={0.3}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
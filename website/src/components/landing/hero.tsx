import { motion, type Variants } from 'framer-motion';
import { Github, ChevronRight, Star } from 'lucide-react';
import TextGradient from '../ui/text-gradient';
import { cn } from '../../lib/utils';

export default function Hero() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number] 
      } 
    },
  };

  return (
    <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-12 text-center sm:pt-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex max-w-4xl flex-col items-center"
      >
        {/* 1. Version Badge */}
        <motion.div variants={itemVariants} className="mb-12">
          <a 
            href="https://github.com/fuzionix/devtool-plus/releases" 
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 text-xs font-medium text-slate-600 backdrop-blur-sm transition-all hover:border-primary-300 hover:bg-white/80"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary-500"></span>
            <span>v0.5.0 Released</span>
            <ChevronRight className="h-3 w-3 text-slate-400 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        {/* 2. Main Headline */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            <TextGradient className="from-slate-900 via-slate-800 to-slate-500">
              The All-in-One
            </TextGradient>
            <br />
            <TextGradient className="from-primary-600 via-primary-500 to-primary-400">
              I/O Toolbox
            </TextGradient>
          </h1>
        </motion.div>

        {/* 3. Subtitle */}
        <motion.div variants={itemVariants} className="mb-12 max-w-2xl px-4">
          <p className="text-sm text-slate-500 leading-relaxed sm:text-base">
            Privacy-first. Local-only. Built for VS Code. Access 35+ developer tools without leaving your editor.
          </p>
        </motion.div>

        {/* 4. Action Buttons & Stats */}
        <motion.div variants={itemVariants} className="flex w-full items-center justify-center gap-4 sm:flex-row sm:items-start">
          
          {/* Primary Action Group */}
          <div className="flex flex-col items-center gap-2">
            <a
              href="https://marketplace.visualstudio.com/items?itemName=Fuzionix.devtool-plus"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative flex h-12 w-full sm:min-w-[180px] items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 font-medium text-white text-sm transition-all duration-200",
                "hover:bg-slate-800 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0",
                "shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
              )}
            >
              <span>Install Now</span>
            </a>
            <span className="text-xs font-medium text-slate-500">
              15k+ Installs
            </span>
          </div>

          {/* Secondary Action Group */}
          <div className="flex flex-col items-center gap-2">
            <a
              href="https://github.com/fuzionix/devtool-plus"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative flex h-12 w-full sm:min-w-[180px] items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white/40 px-6 font-medium text-slate-700 text-sm backdrop-blur-sm transition-all duration-200",
                "hover:border-slate-300 hover:bg-white/60 hover:-translate-y-0.5 active:translate-y-0",
                "shadow-sm"
              )}
            >
              <Github className="h-4 w-4 transition-transform" />
              <span>GitHub</span>
            </a>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>1.2k Stars</span>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </section>
  );
}
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal as TerminalIcon,
  Copy,
  Check,
  Download
} from 'lucide-react';
import TextGradient from '../ui/text-gradient';

import vscodeLogo from '../../assets/brand/visual-studio-code.svg';
import cursorLogo from '../../assets/brand/cursor.svg';
import windsurfLogo from '../../assets/brand/windsurf-black-symbol.svg';

const MARKETPLACES = [
  {
    name: "Visual Studio Code",
    url: "https://marketplace.visualstudio.com/items?itemName=Fuzionix.devtool-plus",
    icon: vscodeLogo,
  },
  {
    name: "Cursor",
    url: "https://open-vsx.org/extension/Fuzionix/devtool-plus",
    icon: cursorLogo,
  },
  {
    name: "Windsurf",
    url: "https://open-vsx.org/extension/Fuzionix/devtool-plus",
    icon: windsurfLogo,
  }
];

const TerminalWindow = () => {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const command = "code --install-extension Fuzionix.devtool-plus";

  // Animation sequence for the terminal content
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setStep(1), 2000));
    timers.push(setTimeout(() => setStep(2), 3500));

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group w-full mx-auto mb-2">
      {/* Ambient Glow behind Terminal */}
      <div className="absolute w-full rounded-lg" />

      {/* Terminal Container */}
      <div 
        className="relative rounded-lg border border-slate-800 bg-slate-900 overflow-hidden"
        style={{ outline: '8px solid rgba(150, 150, 150, 0.25)' }}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-[#0F1117]/50 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]/80" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]/80" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]/80" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <TerminalIcon className="w-3 h-3" />
            <span>bash — 80x24</span>
          </div>
          <div className="w-12" />
        </div>

        {/* Terminal Content */}
        <div 
          className="p-5 font-mono text-sm"
        >
          {/* Line 1: Command Input */}
          <div className="flex items-center gap-2 text-slate-300">
            <div className="flex-1 whitespace-nowrap">
              <span className="mr-2">$</span>
              <span className="inline-block">
                {command.split('').map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03, duration: 0 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            </div>
          </div>

          {/* Line 2: Output - Installing */}
          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-400"
              >
                Installing extension 'Fuzionix.devtool-plus'...
              </motion.div>
            )}
          </AnimatePresence>

          {/* Line 3: Output - Success */}
          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-400"
              >
                Extension 'Fuzionix.devtool-plus' v0.5.0 was successfully installed!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Copy Button (Floating) */}
        <button
          onClick={handleCopy}
          className="absolute top-10 right-2 p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label="Copy command"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default function Installation() {
  return (
    <section className="relative w-full py-24 px-8 overflow-hidden">
      {/* Background Decoration */}
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center gap-8">

        {/* Header */}
        <div className="text-center space-y-4">
          <div 
            className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 mb-4 text-xs font-medium text-primary-700 backdrop-blur-sm"
          >
            <Download className="h-3 w-3 text-primary-700" />
            <span>Get Started</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Ready to Use <TextGradient className="from-primary-600 via-primary-500 to-primary-400">DevTool+</TextGradient>?
          </h2>
          <p className="text-slate-500 text-md max-w-xl mx-auto">
            Get started in seconds. Install directly from your editor marketplace or via command line.
          </p>
        </div>

        {/* The Terminal */}
        <div className="w-full">
          <TerminalWindow />
        </div>

        {/* Divider */}
        <div className="flex items-center w-full max-w-sm gap-4">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Or open in marketplace</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Marketplace Buttons */}
        <div className="flex items-center justify-center gap-6">
          {MARKETPLACES.map((market, index) => (
            <motion.a
              key={market.name}
              href={market.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + (index * 0.1) }}
              className={`group relative flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-white/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:scale-110 hover:shadow-lg`}
            >
              {/* Icon */}
              <img 
                src={market.icon} 
                alt={`${market.name} Logo`} 
                className="h-6 w-6 object-contain transition-transform duration-300 group-hover:scale-110" 
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
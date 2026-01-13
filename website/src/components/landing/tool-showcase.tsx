import { motion } from 'framer-motion';
import { Blocks } from 'lucide-react';
import TextGradient from '../ui/text-gradient';

export default function ToolShowcase() {
  return (
    <section className="relative z-10 w-full overflow-hidden py-12">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Column: Text Content */}
          <div className="order-1">
            <div className="top-32 flex flex-col gap-8">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 text-xs font-medium text-primary-700 backdrop-blur-sm"
              >
                <Blocks className="h-3 w-3 fill-primary-700" />
                <span>Extensive Library</span>
              </motion.div>

              <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                <TextGradient className="from-slate-900 via-slate-800 to-slate-500">
                  Every Tool
                </TextGradient>
                <br />
                <TextGradient className="from-primary-600 via-primary-500 to-primary-400">
                  One Extension
                </TextGradient>
              </h2>
              
              <p className="max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
                Explore a vast collection of tools designed to enhance your productivity. From code formatters to data converters, our library is constantly expanding to meet your needs.
              </p>

              <div className="flex flex-wrap gap-2">
                {['Encoders', 'Decoders', 'Formatters', 'Generators', 'Converters'].map((tag) => (
                  <span key={tag} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500">
                    {tag}
                  </span>
                ))}
                <span className="rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500">
                  + more added regularly
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual (Marquee) */}
          <div className="justify-center order-2 flex h-[450px] gap-6 overflow-hidden">
          </div>
        </div>
      </div>
    </section>
  );
}
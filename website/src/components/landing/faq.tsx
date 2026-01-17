import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';
import TextGradient from '../ui/text-gradient';
import { cn } from '../../lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Does this extension collect any telemetry?",
    answer: "No. DevTool+ is built on the principle of absolute privacy. There are no tracking scripts, no telemetry, and no external API calls. Your code and data never leave your machine."
  },
  {
    question: "Will it slow down my code editor?",
    answer: "Not at all. DevTool+ is built using Lit, a lightweight web component library. The extension and its views are only loaded into memory when you actually open the side panel, ensuring your editor remains fast."
  },
  {
    question: "Does it match my editor's theme?",
    answer: "Yes. The UI uses native CSS variables provided by VS Code. It automatically adapts colors, borders, and typography to match your current theme (Light, Dark, or High Contrast)."
  },
  {
    question: "Is it really free?",
    answer: "Yes, it is completely free and open-source. There are no ads, no paywalls, and no premium-only features."
  },
  {
    question: "Can I use it offline?",
    answer: "Absolutely. Since there are no network requests involved, every tool works perfectly without an internet connection. It's safe to use in air-gapped environments."
  }
];

const AccordionItem = ({ 
  item, 
  isOpen, 
  onClick,
  index 
}: { 
  item: FAQItem; 
  isOpen: boolean; 
  onClick: () => void;
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
      className="border-b border-slate-200 last:border-0"
    >
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between py-6 text-left transition-colors hover:text-primary-600"
      >
        <span className={cn(
          "text-base font-medium transition-colors",
          isOpen ? "text-primary-700" : "text-slate-800"
        )}>
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "ml-4 flex-shrink-0 text-slate-400",
            isOpen && "text-primary-500"
          )}
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-sm leading-relaxed text-slate-500">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative z-10 w-full py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          
          {/* Left Column: Narrative */}
          <div className="relative">
            <div className="top-32 flex flex-col gap-8">
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 text-xs font-medium text-primary-700 backdrop-blur-sm"
              >
                <MessageCircleQuestion className="h-3 w-3 fill-primary-700" />
                <span>Support</span>
              </motion.div>

              <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                <TextGradient className="from-slate-900 via-slate-800 to-slate-500">
                  Common
                </TextGradient>
                <br />
                <TextGradient className="from-primary-600 via-primary-500 to-primary-400">
                  Questions
                </TextGradient>
              </h2>
              
              <p className="max-w-md text-sm leading-relaxed text-slate-500 sm:text-base">
                Everything you need to know about DevTool+. If you have more questions, feel free to open an issue on GitHub.
              </p>

              <div>
                 <a 
                  href="https://github.com/fuzionix/devtool-plus/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline underline-offset-4"
                 >
                   Ask a question on GitHub &rarr;
                 </a>
              </div>
            </div>
          </div>

          {/* Right Column: Accordion */}
          <div className="relative rounded-2xl border border-white/60 bg-white/40 p-1 backdrop-blur-md">
            <div className="rounded-xl border border-slate-100 bg-white/50 px-6 py-2 shadow-sm">
              {FAQS.map((faq, index) => (
                <AccordionItem
                  key={index}
                  index={index}
                  item={faq}
                  isOpen={openIndex === index}
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
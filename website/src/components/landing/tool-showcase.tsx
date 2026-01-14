import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Blocks,
  FileDigit,
  Link2,
  Link,
  Binary,
  BookType,
  CodeXml,
  PaintbrushVertical,
  SwatchBook,
  Rainbow,
  Tangent,
  Contrast,
  Blend,
  RectangleEllipsis,
  ChevronsLeftRightEllipsis,
  FileJson,
  FileWarning,
  FileCode,
  CalendarClock,
  FileDiff,
  Table,
  NotepadText,
  CaseUpper,
  QrCode,
  Server,
  Save,
  FolderPen,
  Tag,
  Asterisk,
  ShieldCheck,
  LockKeyhole,
  Hash,
  KeyRound,
  FileKey2,
  Signature,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import TextGradient from '../ui/text-gradient';

type Category = 'encoder' | 'ui' | 'data' | 'text' | 'crypto' | 'utility';

interface Tool {
  name: string;
  category: Category;
  icon: React.ElementType;
}

const TOOLS: Tool[] = [
  { name: 'Base64 Encoder', category: 'encoder', icon: FileDigit },
  { name: 'URL Encoder', category: 'encoder', icon: Link2 },
  { name: 'URL Parser', category: 'encoder', icon: Link },
  { name: 'ASCII Binary', category: 'encoder', icon: Binary },
  { name: 'Unicode Inspector', category: 'encoder', icon: BookType },
  { name: 'Escape HTML', category: 'encoder', icon: CodeXml },
  { name: 'Color Convertor', category: 'ui', icon: PaintbrushVertical },
  { name: 'Color Palette', category: 'ui', icon: SwatchBook },
  { name: 'Gradient Maker', category: 'ui', icon: Rainbow },
  { name: 'Cubic Bezier', category: 'ui', icon: Tangent },
  { name: 'Contrast Checker', category: 'ui', icon: Contrast },
  { name: 'Color Mixer', category: 'ui', icon: Blend },
  { name: 'UUID Generator', category: 'data', icon: RectangleEllipsis },
  { name: 'Format Convertor', category: 'data', icon: ChevronsLeftRightEllipsis },
  { name: 'JSON Editor', category: 'data', icon: FileJson },
  { name: 'YAML Editor', category: 'data', icon: FileWarning },
  { name: 'HTML Editor', category: 'data', icon: FileCode },
  { name: 'Datetime Convertor', category: 'data', icon: CalendarClock },
  { name: 'Difference Checker', category: 'text', icon: FileDiff },
  { name: 'Markdown Table', category: 'text', icon: Table },
  { name: 'Lorem Ipsum', category: 'text', icon: NotepadText },
  { name: 'Slug Generator', category: 'text', icon: CaseUpper },
  { name: 'QR Code', category: 'utility', icon: QrCode },
  { name: 'HTTP Status', category: 'utility', icon: Server },
  { name: 'Data Unit', category: 'utility', icon: Save },
  { name: 'Path Convertor', category: 'utility', icon: FolderPen },
  { name: 'Number Base', category: 'utility', icon: Binary },
  { name: 'Token Generator', category: 'crypto', icon: Tag },
  { name: 'Password Generator', category: 'crypto', icon: Asterisk },
  { name: 'JWT Inspector', category: 'crypto', icon: ShieldCheck },
  { name: 'AES Encryption', category: 'crypto', icon: LockKeyhole },
  { name: 'SHA Hashing', category: 'crypto', icon: Hash },
  { name: 'RSA Key Gen', category: 'crypto', icon: KeyRound },
  { name: 'RSA Encryption', category: 'crypto', icon: FileKey2 },
  { name: 'Signature Signer', category: 'crypto', icon: Signature },
];

const CATEGORY_COLORS: Record<Category, string> = {
  encoder: 'bg-blue-500',
  ui: 'bg-pink-500',
  data: 'bg-emerald-500',
  text: 'bg-amber-500',
  crypto: 'bg-purple-500',
  utility: 'bg-slate-500',
};

const ToolBadge = ({ tool }: { tool: Tool }) => (
  <div className="group flex items-center gap-3 rounded-full border border-white/40 bg-white/30 px-4 py-2 transition-all hover:border-white/60 hover:bg-white/60">
    <div className={cn("flex items-center justify-center   text-slate-600 transition-colors group-hover:text-slate-900")}>
      <tool.icon className="h-4 w-4" />
    </div>
    <div>
      <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">{tool.name}</span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", CATEGORY_COLORS[tool.category])} />
      <span className="text-[10px] font-medium uppercase pt-[1px]  text-slate-500 opacity-80">
        {tool.category}
      </span>
    </div>
  </div>
);

const MarqueeRow = ({ 
  tools, 
  direction = 'left', 
  speed = 20 
}: { 
  tools: Tool[]; 
  direction?: 'left' | 'right'; 
  speed?: number; 
}) => {
  const [width, setWidth] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Calculate total width of one set of items
      setWidth(containerRef.current.scrollWidth / 2);
    }
  }, [tools]);

  return (
    <div className="relative flex overflow-hidden py-2">
      <motion.div
        ref={containerRef}
        className="flex gap-4"
        animate={{
          x: direction === 'left' ? [-width, 0] : [0, -width],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
        // Ensure we have enough items to loop smoothly
        style={{ width: 'max-content' }}
      >
        {[...tools, ...tools].map((tool, idx) => (
          <ToolBadge key={`${tool.name}-${idx}`} tool={tool} />
        ))}
      </motion.div>
    </div>
  );
};

export default function ToolShowcase() {
  const shuffledTools = React.useMemo(() => [...TOOLS].sort(() => Math.random() - 0.5), []);
  
  const row1 = shuffledTools.slice(0, 8);
  const row2 = shuffledTools.slice(8, 16);
  const row3 = shuffledTools.slice(16, 24);

  return (
    <section className="relative z-10 w-full overflow-hidden py-12">
      <div className="mx-auto max-w-7xl px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          
          {/* Left Column: Text Content */}
          <div className="order-1 relative z-10">
            <div className="flex flex-col gap-8">
              <div 
                className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white/50 px-3 py-1 text-xs font-medium text-primary-700 backdrop-blur-sm"
              >
                <Blocks className="h-3 w-3 fill-primary-700" />
                <span>Extensive Library</span>
              </div>

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
                  <span key={tag} className="rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs text-slate-500 backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
                <span className="rounded-md border border-dashed border-slate-300 px-2 py-1 text-xs text-slate-500">
                  + more added regularly
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Marquee Visuals */}
          <div className="order-2 relative">
            <div 
              className="flex flex-col gap-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
            >
              <MarqueeRow tools={row1} direction="left" speed={40} />
              <MarqueeRow tools={row2} direction="right" speed={40} />
              <MarqueeRow tools={row3} direction="left" speed={40} />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
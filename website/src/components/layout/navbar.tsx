import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import { cn } from '../../lib/utils';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'Tool List', href: '#tools' },
  { name: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for glass morphism intensity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300",
          isScrolled 
            ? "backdrop-blur-lg border-b border-slate-200/50 shadow-sm" 
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <a href="#" className="flex items-center gap-2 group">
              <span className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                DevTool<span className="text-primary-600">+</span>
              </span>
            </a>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-slate-500 transition-colors hover:text-primary-600"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/fuzionix/devtool-plus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-slate-900"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <div className="h-4 w-px bg-slate-200" />
            <a
              href="https://marketplace.visualstudio.com/items?itemName=Fuzionix.devtool-plus"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
            >
              <span>Donate ❤️</span>
            </a>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
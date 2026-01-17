import { Github, Twitter, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 w-full pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-8">
        <div className="flex flex-col md:flex-row pt-12 gap-12 lg:gap-16">
          
          {/* Brand Column */}
          <div className="flex flex-1 flex-col gap-4">
            <a href="#" className="flex items-center gap-2 w-fit">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                DevTool<span className="text-primary-600">+</span>
              </span>
            </a>
            <p className="text-sm leading-relaxed max-w-xs text-slate-500">
              The privacy-first developer toolbox that lives directly inside your editor. Open source and free forever.
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/fuzionix/devtool-plus" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5 text-slate-500 hover:text-slate-900" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24 md:col-span-3">
            {/* Links Column 1 */}
            <div className="flex flex-col gap-4 text-left md:text-right">
              <h4 className="font-semibold text-sm text-slate-900">Product</h4>
              <ul className="flex flex-col gap-2 text-sm text-slate-500">
                <li><a href="#features" className="transition-colors hover:text-primary-600">Features</a></li>
                <li><a href="#tools" className="transition-colors hover:text-primary-600">Tool Library</a></li>
                <li><a href="#installation" className="transition-colors hover:text-primary-600">Installation</a></li>
                <li><a href="#faq" className="transition-colors hover:text-primary-600">FAQ</a></li>
              </ul>
            </div>

            {/* Links Column 2 */}
            <div className="flex flex-col gap-4 text-left md:text-right">
              <h4 className="font-semibold text-sm text-slate-900">Resources</h4>
              <ul className="flex flex-col gap-2 text-sm text-slate-500">
                <li><a href="https://github.com/fuzionix/devtool-plus" className="transition-colors hover:text-primary-600">Documentation</a></li>
                <li><a href="https://github.com/fuzionix/devtool-plus/issues" className="transition-colors hover:text-primary-600">Report an Issue</a></li>
                <li><a href="#" className="transition-colors hover:text-primary-600">Contributing</a></li>
                <li><a href="https://github.com/fuzionix/devtool-plus/releases" className="transition-colors hover:text-primary-600">Changelog</a></li>
              </ul>
            </div>

            {/* Links Column 3 */}
            <div className="flex flex-col gap-4 text-left md:text-right">
              <h4 className="font-semibold text-sm text-slate-900">Legal</h4>
              <ul className="flex flex-col gap-2 text-sm text-slate-500">
                <li><a href="#" className="transition-colors hover:text-primary-600">Privacy Policy</a></li>
                <li><a href="#" className="transition-colors hover:text-primary-600">Terms of Service</a></li>
                <li><a href="https://github.com/fuzionix/devtool-plus/blob/main/LICENSE" className="transition-colors hover:text-primary-600">MIT License</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {currentYear} Fuzionix. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <span>Made with</span>
            <Heart className="h-3 w-3 fill-red-400 text-red-400" />
            <span>by developers, for developers.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
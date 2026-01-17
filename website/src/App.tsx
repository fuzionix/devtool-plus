import Background from './components/layout/background';
import Navbar from './components/layout/navbar';
import Hero from './components/landing/hero';
import EditorDemo from './components/landing/editor-demo';
import Features from './components/landing/features';
import ToolShowcase from './components/landing/tool-showcase';
import Installation from './components/landing/installation';
import FAQ from './components/landing/faq';
import Footer from './components/landing/footer';

function App() {
    return (
        <div className="relative min-h-screen w-full font-sans text-slate-900 selection:bg-primary-100 selection:text-primary-900">
            {/* The Stage: Fixed Background with Parallax */}
            <Background />

            {/* Navigation: Fixed Top Bar */}
            <Navbar />

            {/* The Content: Scrollable Context */}
            <main className="relative z-10 flex min-h-screen flex-col items-center pt-24 pb-0">
                {/* Hero Section */}
                <Hero />
                
                {/* Editor Demo Visualization */}
                <div className="mt-[-20px] w-full sm:mt-0">
                    <EditorDemo />
                </div>

                {/* Value Proposition */}
                <Features />

                {/* Tool Showcase Marquee */}
                <ToolShowcase />

                {/* Installation Instructions */}
                <Installation />

                {/* FAQ Section */}
                <FAQ />

                {/* Footer Section */}
                <Footer />
            </main>
        </div>
    );
}

export default App;
import Background from './components/layout/background';
import Hero from './components/landing/hero';

function App() {
    return (
        <div className="relative min-h-screen w-full font-sans text-slate-900 selection:bg-primary-100 selection:text-primary-900">
            {/* The Stage: Fixed Background with Parallax */}
            <Background />

            {/* The Content: Scrollable Context */}
            <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-24 pb-20">
                <Hero />
            </main>
        </div>
    );
}

export default App;
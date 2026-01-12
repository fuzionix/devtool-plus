import { motion, useScroll, useTransform } from 'framer-motion';

export default function Background() {
    const { scrollY } = useScroll();

    // Parallax Logic:
    // As the user scrolls down, the background elements shift slightly.
    const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
    const y2 = useTransform(scrollY, [0, 1000], [0, 200]);

    return (
        <div className="fixed inset-0 z-0 h-full w-full overflow-hidden pointer-events-none select-none">
            {/* 1. Base Porcelain Layer */}
            <div className="absolute inset-0 bg-porcelain" />

            {/* 2. Ambient Light Sources (The "Breath") */}
            <motion.div
                style={{ y: y1, opacity: 0.6 }}
                className="absolute -left-[10%] -top-[10%] h-[700px] w-[700px] rounded-full bg-primary-200 blur-[120px] mix-blend-multiply will-change-transform"
            />
            
            <motion.div
                style={{ y: y2, opacity: 0.6 }}
                className="absolute -right-[5%] top-[20%] h-[600px] w-[600px] rounded-full bg-purple-200 blur-[120px] mix-blend-multiply will-change-transform"
            />

            {/* 3. Grid Pattern (Defined in index.css) */}
            <div className="absolute inset-0 bg-grid-pattern opacity-0.75" />
            
            {/* 4. Bottom Vignette */}
            {/* Soft fade at the bottom to ensure infinite scroll feel if needed */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-porcelain to-transparent" />
        </div>
    );
}
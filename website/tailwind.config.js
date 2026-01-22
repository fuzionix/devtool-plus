/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Sora", "system-ui", "sans-serif"],
            },
            colors: {
                porcelain: "#f7f8fa",
                mist: "#e6e8ee",

                primary: {
                    DEFAULT: "#22a5f1",
                    50: "#f0f9ff",
                    100: "#e0f2fe",
                    200: "#bae6fd",
                    300: "#7dd3fc",
                    400: "#38bdf8",
                    500: "#22a5f1",
                    600: "#0284c7",
                    700: "#0369a1",
                    800: "#075985",
                    900: "#0c4a6e",
                },
                glass: {
                    border: "rgba(255, 255, 255, 0.5)",
                    surface: "rgba(255, 255, 255, 0.7)",
                    highlight: "rgba(255, 255, 255, 0.8)",
                }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #22a5f1 0deg, #a8d1f9 180deg, #22a5f1 360deg)',
            },
            transitionTimingFunction: {
                'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
                'expo-in': 'cubic-bezier(0.7, 0, 0.84, 0)',
            },
            transitionDuration: {
                '400': '400ms',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'pulse-slow': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'shimmer': {
                    '0%': { backgroundPosition: '200% 0' },
                    '100%': { backgroundPosition: '-200% 0' }
                }
            },
            animation: {
                'fade-in': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 8s linear infinite',
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
                'glass-hover': '0 10px 40px rgba(0, 0, 0, 0.1)',
                'glow': '0 0 20px rgba(34, 165, 241, 0.5)',
            }
        },
    },
    plugins: [],
};
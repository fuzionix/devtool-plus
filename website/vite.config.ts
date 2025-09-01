import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    return {
        base: '/devtool-plus/',
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
            }
        },
        build: {
            outDir: 'dist',
            minify: 'terser',
            sourcemap: mode === 'development',
            terserOptions: {
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                },
            },
            rollupOptions: {
                output: {
                    manualChunks: {
                        react: ['react', 'react-dom'],
                    }
                }
            }
        },
        server: {
            open: true,
            cors: true
        },
        css: {
            devSourcemap: true,
        },
        plugins: [react()],
    }
})

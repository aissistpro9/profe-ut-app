import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Prioritize system environment variables (Coolify) over .env file
    const geminiKey = process.env.VITE_GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
    const youtubeKey = process.env.VITE_YOUTUBE_API_KEY || env.VITE_YOUTUBE_API_KEY || '';
    return {
      server: {
        port: 5173,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
        'process.env.YOUTUBE_API_KEY': JSON.stringify(youtubeKey),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'es2022',
        sourcemap: false,
        minify: 'esbuild',
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-genai': ['@google/genai'],
              'vendor-marked': ['marked'],
            }
          }
        }
      }
    };
});

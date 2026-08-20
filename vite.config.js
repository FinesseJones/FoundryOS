import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  esbuild: {
    jsx: 'automatic'
  },
  server: {
    fs: {
      strict: false,
      allow: ['..', '.']
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'sonner',
            'react-hot-toast'
          ]
        }
      }
    }
  }
});
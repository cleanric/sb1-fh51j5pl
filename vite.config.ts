import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000, // Increase limit to avoid warnings
    rollupOptions: {
      output: {
        manualChunks: {
          // React and React DOM
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Web3 and crypto libraries
          'web3-vendor': [
            '@web3modal/ethers',
            'ethers'
          ],
          
          // Auth libraries
          'auth-vendor': [
            '@auth0/auth0-react',
            'appwrite',
            'node-appwrite',
            'jsonwebtoken'
          ],
          
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-icons',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group',
            '@radix-ui/react-visually-hidden'
          ],
          
          // Form and validation libraries
          'form-vendor': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          
          // Utility libraries
          'utils-vendor': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'cmdk',
            'date-fns',
            'lucide-react',
            'sonner',
            'vaul'
          ],
          
          // OpenAI and other APIs
          'api-vendor': [
            'openai',
            'stripe'
          ]
        }
      }
    }
  }
});
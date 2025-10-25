import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    // Inject environment variables
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@supabase/supabase-js',
      'react-hot-toast',
      'date-fns',
      'recharts',
      'lucide-react'
    ],
  },
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    // Enable source maps only in development
    sourcemap: process.env.NODE_ENV !== 'production',
    // Minimize bundle size
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : [],
      },
    },
    // Enhanced bundle optimization
    rollupOptions: {
      output: {
        // Optimized chunk splitting strategy
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'utilities': ['date-fns', 'react-hot-toast'],
          'ui': ['lucide-react'],
          'charts': ['recharts'],
          'office': ['xlsx', 'jspdf', 'html2canvas'],
        },
        // Optimize asset filenames
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Reduce chunk size warning limit for better performance
    chunkSizeWarningLimit: 500,
    // Target modern browsers for smaller bundle
    target: 'esnext',
  },
  // Enhanced development server configuration
  server: {
    port: 5173,
    host: true, // Allow external connections
    cors: true,
    hmr: {
      overlay: false, // Disable error overlay in development
    },
    // Proxy configuration for development
    proxy: {},
  },
  preview: {
    port: 4173,
    cors: true
  },
  // CSS preprocessing
  css: {
    devSourcemap: true,
    postcss: {
      plugins: [
        // Additional PostCSS plugins can be added here
      ],
    },
  }
});
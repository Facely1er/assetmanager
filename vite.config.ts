import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html when ANALYZE=true
    process.env.ANALYZE === 'true' && visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // treemap, sunburst, network
    }),
  ].filter(Boolean),
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
      'react/jsx-runtime',
      '@supabase/supabase-js',
      'react-hot-toast',
      'date-fns',
      'recharts',
      'lucide-react'
    ],
    // Exclude heavy libraries from pre-bundling to enable better code splitting
    exclude: [
      'xlsx',
      'jspdf', 
      'html2canvas'
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
        // Optimized chunk splitting strategy with granular vendor splitting
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-utils';
          }
          // Toast notifications
          if (id.includes('node_modules/react-hot-toast')) {
            return 'toast';
          }
          // Icons
          if (id.includes('node_modules/lucide-react')) {
            return 'icons';
          }
          // Charts library
          if (id.includes('node_modules/recharts')) {
            return 'charts';
          }
          // Office/Export utilities
          if (id.includes('node_modules/xlsx') || 
              id.includes('node_modules/jspdf') || 
              id.includes('node_modules/html2canvas')) {
            return 'office-utils';
          }
          // Split large component groups
          if (id.includes('/src/components/reports/')) {
            return 'reports';
          }
          if (id.includes('/src/components/compliance/')) {
            return 'compliance';
          }
          if (id.includes('/src/components/vulnerabilities/')) {
            return 'vulnerabilities';
          }
          if (id.includes('/src/components/organizations/')) {
            return 'organizations';
          }
          if (id.includes('/src/components/privacy/')) {
            return 'privacy';
          }
          if (id.includes('/src/components/protection/')) {
            return 'protection';
          }
          if (id.includes('/src/components/dependencies/')) {
            return 'dependencies';
          }
          if (id.includes('/src/services/')) {
            return 'services';
          }
          // Other node_modules as vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk file naming
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
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
          if (/css/i.test(ext)) {
            return `styles/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Reduce chunk size warning limit for better performance
    chunkSizeWarningLimit: 400,
    // Target modern browsers for smaller bundle
    target: 'esnext',
    // CSS code splitting
    cssCodeSplit: true,
    // Improve tree shaking
    modulePreload: {
      polyfill: false
    },
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
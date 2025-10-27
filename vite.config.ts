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
      'lucide-react'
    ],
    exclude: [
      // Exclude large libraries from pre-bundling to enable better tree shaking
      'xlsx',
      'jspdf', 
      'html2canvas',
      'recharts'
    ],
    // Force optimization of specific modules
    force: true
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
        // Additional compression options
        passes: 2,
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
      },
      mangle: {
        // Mangle property names for better compression
        properties: {
          regex: /^_/
        }
      }
    },
    // Enhanced bundle optimization
    rollupOptions: {
      output: {
        // Optimized chunk splitting strategy
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // UI libraries
          if (id.includes('lucide-react')) {
            return 'ui-icons';
          }
          
          // Chart libraries - split into smaller chunks
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Office/PDF libraries - split further
          if (id.includes('xlsx')) {
            return 'office-xlsx';
          }
          if (id.includes('jspdf')) {
            return 'office-pdf';
          }
          if (id.includes('html2canvas')) {
            return 'office-canvas';
          }
          
          // Utility libraries
          if (id.includes('date-fns') || id.includes('react-hot-toast')) {
            return 'utilities';
          }
          
          // Large components - split by feature
          if (id.includes('AssetInventoryDashboard')) {
            return 'feature-assets';
          }
          if (id.includes('AdvancedReportingDashboard') || id.includes('InsightsDashboard')) {
            return 'feature-reports';
          }
          if (id.includes('ComplianceManagement') || id.includes('PrivacyComplianceDashboard')) {
            return 'feature-compliance';
          }
          if (id.includes('VulnerabilityDashboard') || id.includes('DependenciesMappingDashboard')) {
            return 'feature-security';
          }
          
          // Node modules
          if (id.includes('node_modules')) {
            // Group smaller libraries together
            if (id.includes('lodash') || id.includes('ramda')) {
              return 'vendor-utils';
            }
            return 'vendor';
          }
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
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        // Optimize entry file names
        entryFileNames: 'js/[name]-[hash].js'
      }
    },
    // Reduce chunk size warning limit for better performance
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for smaller bundle
    target: 'esnext',
    // Additional build optimizations
    cssCodeSplit: true,
    reportCompressedSize: true,
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
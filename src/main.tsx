import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandling } from './utils/monitoring';
import { performanceMonitor } from './utils/performance';

// Setup global error handling for production
setupGlobalErrorHandling();

// Initialize performance monitoring
performanceMonitor;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

// Enhanced app initialization with error handling
try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  // Hide loading screen after app is rendered
  setTimeout(() => {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }
  }, 100);
} catch (error) {
  if (import.meta.env.DEV) {
    console.error('Failed to initialize application:', error);
  }

  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : '';
  const isDev = import.meta.env.DEV;

  // Fallback error UI with improved error recovery
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      color: #374151;
      text-align: center;
      padding: 2rem;
    ">
      <div style="max-width: 32rem;">
        <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #dc2626;">
          Application Error
        </h1>
        <p style="margin-bottom: 1.5rem;">
          We encountered an error while starting the application. Please try refreshing the page.
        </p>
        ${isDev ? `
          <details style="margin-bottom: 1.5rem; text-align: left; background: #fef2f2; padding: 1rem; border-radius: 0.5rem; border: 1px solid #fecaca;">
            <summary style="cursor: pointer; font-weight: 500; color: #dc2626;">Error Details (Development Only)</summary>
            <pre style="margin-top: 0.5rem; overflow-x: auto; font-size: 0.75rem; white-space: pre-wrap; word-break: break-word;">${errorMessage}\n\n${errorStack}</pre>
          </details>
        ` : ''}
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button
            onclick="window.location.reload()"
            style="
              background: #2563eb;
              color: white;
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 0.5rem;
              cursor: pointer;
              font-weight: 500;
            "
          >
            Refresh Page
          </button>
          <button
            onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();"
            style="
              background: #6b7280;
              color: white;
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 0.5rem;
              cursor: pointer;
              font-weight: 500;
            "
          >
            Clear Cache & Refresh
          </button>
        </div>
        <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #6b7280;">
          If the issue persists, please contact support.
        </p>
      </div>
    </div>
  `;
}
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { setupGlobalErrorHandling } from './utils/monitoring';

// Setup global error handling for production
setupGlobalErrorHandling();

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
} catch (error) {
  console.error('Failed to initialize application:', error);
  
  // Fallback error UI
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
      <div>
        <h1 style="font-size: 2rem; font-weight: bold; margin-bottom: 1rem; color: #dc2626;">
          Application Error
        </h1>
        <p style="margin-bottom: 2rem; max-width: 28rem;">
          We encountered an error while starting the application. Please refresh the page or contact support if the issue persists.
        </p>
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
      </div>
    </div>
  `;
}
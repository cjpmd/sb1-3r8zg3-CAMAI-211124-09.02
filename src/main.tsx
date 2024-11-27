import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { initDB } from './lib/db';
import { setupDebugListeners, checkEnvironment } from './utils/debug';

// Initialize IndexedDB first
initDB().catch(error => {
  console.error('Failed to initialize IndexedDB:', error);
});

// Setup debug listeners
setupDebugListeners();

// Check environment variables
checkEnvironment();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
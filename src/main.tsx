import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initLocale } from '@ui/i18n/index.js';
import App from './App.js';
import './index.css';

initLocale();

const container = document.getElementById('root');
if (!container) throw new Error('#root element not found.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

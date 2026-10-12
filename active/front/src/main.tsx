import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Carbon design system styles — must come after Carbon component imports in App
import '@carbon/styles/css/styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('No #root element found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

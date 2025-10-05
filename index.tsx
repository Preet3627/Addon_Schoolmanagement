import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('wpsm-qr-attendance-app');
if (!rootElement) {
  throw new Error("Could not find root element '#wpsm-qr-attendance-app' to mount to. Make sure the shortcode is on the page.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

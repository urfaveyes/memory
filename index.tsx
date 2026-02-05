import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App'; // Corrected path: App is in the components directory

// Find the root element in index.html where the React app will be mounted.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root and render the App component in strict mode.
// React.StrictMode helps in highlighting potential problems in an application.
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
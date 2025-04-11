import React from 'react';
import ReactDOM from 'react-dom/client';
import RouterMain from './Route';
import { createRoot } from 'react-dom/client';
// import App from './App';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterMain />
  </React.StrictMode>
);

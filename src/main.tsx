// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './AppRouter'; // ou App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> {/* ✅ ICI UNIQUEMENT */}
      <AppRouter />
    </BrowserRouter>
  </React.StrictMode>
);

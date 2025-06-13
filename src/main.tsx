// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

document.addEventListener('visibilitychange', () => {
  const el = document.getElementById('dashboard');
  if (el) {
    el.style.animationPlayState = document.hidden ? 'paused' : 'running';
  }
});

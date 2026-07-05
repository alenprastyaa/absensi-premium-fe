import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<App />} />
        <Route path="/dashboard" element={<App />} />
        <Route path="/schools" element={<App />} />
        <Route path="/teachers" element={<App />} />
        <Route path="/attendance" element={<App />} />
        <Route path="/classes" element={<App />} />
        <Route path="/students" element={<App />} />
        <Route path="/scan" element={<App />} />
        <Route path="/academic" element={<App />} />
        <Route path="/password" element={<App />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

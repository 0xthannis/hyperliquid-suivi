import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { TradesApp } from './pages/TradesApp';
import './index.css';

const isElectron = import.meta.env.VITE_ELECTRON === 'true';
const Router = isElectron ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<TradesApp />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/methodology" element={<MethodologyPage />} />
      </Routes>
    </Router>
  </StrictMode>
);

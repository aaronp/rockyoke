import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Rolodex from './pages/Rolodex.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/rockyoke">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/rolodex" element={<Rolodex />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

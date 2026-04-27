import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Jukebox from './pages/Jukebox.tsx'
import OrderComplete from './pages/OrderComplete.tsx'
import About from './pages/About.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/">
      <Routes>
        <Route path="/" element={<Jukebox />} />
        <Route path="/order-complete" element={<OrderComplete />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)

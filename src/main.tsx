import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { ToastProvider } from './components/Toast.tsx'
import Jukebox from './pages/Jukebox.tsx'
import OrderComplete from './pages/OrderComplete.tsx'
import About from './pages/About.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Jukebox />} />
          <Route path="/order-complete" element={<OrderComplete />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
)

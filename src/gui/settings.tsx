import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Settings } from './components/Settings'
import './index.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <div className="min-h-screen bg-gray-100">
      <Settings />
    </div>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Overlay } from './components/Overlay'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <div className="min-h-screen bg-transparent">
      <ErrorBoundary>
        <Overlay />
      </ErrorBoundary>
    </div>
  </StrictMode>,
)

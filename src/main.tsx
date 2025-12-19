import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/index.css'
import App from '@/App'
import ErrorBoundary from '@/components/ErrorBoundary'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

try {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  )
} catch (error) {
  console.error('Error rendering app:', error)
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; background: #fee; border: 2px solid #f00;">
        <h1>Rendering Error</h1>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
        <pre>${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `
  }
}


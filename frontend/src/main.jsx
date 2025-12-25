import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import eruda from 'eruda'

// Initialize Eruda mobile debugging console
// This will show a floating button on the screen that opens a mobile-friendly dev console
eruda.init()
console.log('%c✅ Eruda mobile debugging console initialized', 'color: #10b981; font-weight: bold')
console.log('%cTap the floating icon in the bottom-right to open the console', 'color: #10b981')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

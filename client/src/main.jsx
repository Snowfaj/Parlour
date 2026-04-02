import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1f1f2e',
          color: '#fff',
          borderRadius: '12px',
          border: '1px solid rgba(124,58,237,0.3)',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#a855f7', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
      }}
    />
  </React.StrictMode>,
)

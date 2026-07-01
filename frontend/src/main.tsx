import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import App from './App'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'

import './App.css'
import '../i18n'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--bg-elevated)',
          border: '1px solid var(--gold-mid)',
          color: 'var(--gold-whisper)',
          fontFamily: 'Futura, system-ui, sans-serif',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        },
        success: {
          iconTheme: {
            primary: 'var(--gold-mid)',
            secondary: 'var(--bg-elevated)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'var(--bg-elevated)',
          },
        },
      }}
    />
  </BrowserRouter>
)

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import LanguageToggle from '../components/LanguageToggle'
import { setAuth, encodeCredentials } from '../lib/auth'

function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleLogin = async () => {
    if (!user.trim() || !pass.trim()) {
      setError(t('admin.missingFields'))
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const token = encodeCredentials(user, pass)
      const res = await fetch('/api/admin/tickets', {
        headers: { Authorization: `Basic ${token}` },
      })

      if (!res.ok) {
        setError(t('admin.loginFailed'))
        return
      }

      setAuth(token)
      navigate('/admin')
    } catch {
      setError(t('admin.loginFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            {t('admin.title')}
          </h1>

          <input
            type="text"
            placeholder={t('admin.username')}
            value={user}
            onChange={e => setUser(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder={t('admin.password')}
            value={pass}
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 rounded-lg border border-slate-300 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoComplete="current-password"
          />

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300 transition"
          >
            {submitting ? t('admin.signingIn') : t('admin.signIn')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
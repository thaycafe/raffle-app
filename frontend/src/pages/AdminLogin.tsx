import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import LanguageToggle from '../components/shared/LanguageToggle'
import FloatingParticles from '../components/shared/FloatingParticles'
import { setAuth, encodeCredentials } from '../service/auth'
import { Eye, EyeOff } from 'lucide-react'

function AdminLogin() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <FloatingParticles count={14} />

      <div className="relative w-full max-w-sm" style={{ zIndex: 10 }}>
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>

        <div className="bg-(--bg-surface) rounded-2xl shadow-sm p-8 border border-(--gold-dark)/50">
          <h1 className="text-(--gold-light) text-2xl font-bold mb-6 text-center">
            {t('admin.title')}
          </h1>

          <input
            type="text"
            placeholder={t('admin.username')}
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-(--bg-base) border border-(--gold-dark) text-(--gold-mid) placeholder-(--gold-dark) mb-3 focus:outline-none focus:ring-2 focus:ring-(--gold-mid) focus:border-(--gold-mid) transition"
            autoComplete="username"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={t('admin.password')}
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-(--bg-base) border border-(--gold-dark) text-(--gold-mid) placeholder-(--gold-dark) focus:outline-none focus:ring-2 focus:ring-(--gold-mid) focus:border-(--gold-mid) transition"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t('admin.hidePassword') : t('admin.showPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-(--gold-dark) hover:text-(--gold-mid) transition cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={submitting}
            className="w-full bg-(--gold-mid) text-(--bg-base) py-3 rounded-lg font-bold hover:bg-(--gold-light) disabled:bg-(--bg-surface) disabled:text-(--gold-dark)/50 disabled:border disabled:border-(--gold-dark)/30 disabled:cursor-not-allowed transition"
          >
            {submitting ? t('admin.signingIn') : t('admin.signIn')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin

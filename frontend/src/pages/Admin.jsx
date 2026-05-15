import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import LanguageToggle from '../components/LanguageToggle'
import { getAuth, authHeader, clearAuth } from '../lib/auth'

function Admin() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')

  const logout = () => {
    clearAuth()
    navigate('/admin/login')
  }

  const loadTickets = async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/tickets', { headers: authHeader() })
      if (res.status === 401) {
        logout()
        return
      }
      if (!res.ok) throw new Error('Failed to load')
      setTickets(await res.json())
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    // se não tem auth, manda pra tela de login
    if (!getAuth()) {
      navigate('/admin/login')
      return
    }
    loadTickets()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>

        <header className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t('admin.dashboardTitle')}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {tickets.length} {t('admin.reservations')}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm text-slate-600 hover:text-slate-900 transition"
          >
            {t('admin.signOut')}
          </button>
        </header>

        <section className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          {tickets.length === 0 ? (
            <p className="text-slate-500 text-center py-6">
              {t('admin.empty')}
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 text-slate-600">
                  <th className="py-2 pr-4">#</th>
                  <th className="pr-4">{t('admin.name')}</th>
                  <th className="pr-4">{t('admin.phone')}</th>
                  <th className="pr-4">{t('admin.paid')}</th>
                  <th>{t('admin.reservedAt')}</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.number} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-mono">{ticket.number}</td>
                    <td className="pr-4">{ticket.name}</td>
                    <td className="pr-4 text-slate-600">{ticket.phone}</td>
                    <td className="pr-4">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          ticket.paid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {ticket.paid ? t('admin.paidYes') : t('admin.paidNo')}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">
                      {ticket.reserved_at
                        ? new Date(ticket.reserved_at).toLocaleString()
                        : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}

export default Admin
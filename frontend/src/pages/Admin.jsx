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
  const [busy, setBusy] = useState(null) // número do ticket em ação

  const logout = () => {
    clearAuth()
    navigate('/')
  }

  const loadTickets = async () => {
    setError('')
    try {
      const res = await fetch('/api/admin/tickets', { headers: authHeader() })
      if (res.status === 401) {
        clearAuth()
        navigate('/admin/login')
        return
      }
      if (!res.ok) throw new Error('Failed to load')
      setTickets(await res.json())
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    if (!getAuth()) {
      navigate('/admin/login')
      return
    }
    // load data once on mount; safe to ignore set-state-in-effect here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const togglePaid = async (ticket) => {
    setBusy(ticket.number)
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.number}/paid`, {
        method: 'PATCH',
        headers: {
          ...authHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paid: !ticket.paid }),
      })
      if (!res.ok) throw new Error('Failed to update')
      await loadTickets()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  const removeTicket = async (number) => {
    if (!confirm(t('admin.confirmDelete', { number }))) return
    setBusy(number)
    try {
      const res = await fetch(`/api/admin/tickets/${number}`, {
        method: 'DELETE',
        headers: authHeader(),
      })
      if (!res.ok) throw new Error('Failed to delete')
      await loadTickets()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>

        <header className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('admin.dashboardTitle')}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {tickets.length} {t('admin.reservations')}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium text-slate-700 bg-gray-100 border border-slate-300 px-4 py-2 rounded-lg hover:bg-gray-300 hover:border-slate-400 transition cursor-pointer"
          >
            {t('admin.signOut')}
          </button>
        </header>

        <section className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          {tickets.length === 0 ? (
            <p className="text-slate-500 text-center py-6">{t('admin.empty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 text-slate-600">
                  <th className="py-2 pr-4">#</th>
                  <th className="pr-4">{t('admin.name')}</th>
                  <th className="pr-4">{t('admin.phone')}</th>
                  <th className="pr-4">{t('admin.paid')}</th>
                  <th className="pr-4">{t('admin.reservedAt')}</th>
                  <th className="text-right">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const isBusy = busy === ticket.number
                  return (
                    <tr key={ticket.number} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono">{ticket.number}</td>
                      <td className="pr-4">{ticket.name}</td>
                      <td className="pr-4 text-slate-600">{ticket.phone}</td>
                      <td className="pr-4">
                        <button
                          onClick={() => togglePaid(ticket)}
                          disabled={isBusy}
                          className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                            ticket.paid
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          } ${isBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                          {ticket.paid ? t('admin.paidYes') : t('admin.paidNo')}
                        </button>
                      </td>
                      <td className="pr-4 text-xs text-slate-500">
                        {ticket.reserved_at ? new Date(ticket.reserved_at).toLocaleString() : ''}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => removeTicket(ticket.number)}
                          disabled={isBusy}
                          className="text-xs text-red-600 hover:text-red-800 hover:underline disabled:opacity-50 disabled:cursor-wait transition"
                        >
                          {t('admin.delete')}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}

export default Admin

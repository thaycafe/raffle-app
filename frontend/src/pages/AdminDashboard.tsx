import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoTrashBinSharp } from 'react-icons/io5'

import LanguageToggle from '../components/shared/LanguageToggle'
import { getAuth, authHeader, clearAuth } from '../service/auth'

type AdminTicket = {
  number: number
  name: string
  phone: string
  paid: boolean
  reserved_at: string | null
}

function AdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<number | null>(null)

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
      setTickets((await res.json()) as AdminTicket[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  useEffect(() => {
    if (!getAuth()) {
      navigate('/admin/login')
      return
    }
    void loadTickets()
  }, [])

  const togglePaid = async (ticket: AdminTicket) => {
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
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(null)
    }
  }

  const removeTicket = async (number: number) => {
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
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">

      <div className="relative max-w-5xl mx-auto" style={{ zIndex: 10 }}>
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>

        <header className="bee-header rounded-2xl shadow-sm p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-(--gold-light)">{t('admin.dashboardTitle')}</h1>
            <p className="text-(--gold-light) text-sm mt-1">
              {tickets.length} {t('admin.reservations')}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium bg-(--bg-base) text-(--gold-mid) border border-(--gold-dark) px-4 py-2 rounded-lg hover:bg-(--bg-surface) hover:border-(--gold-mid) transition cursor-pointer"
          >
            {t('admin.signOut')}
          </button>
        </header>

        <section className="bg-(--bg-surface) rounded-2xl shadow-sm p-6 overflow-x-auto border border-(--gold-dark)/50">
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          {tickets.length === 0 ? (
            <p className="text-(--gold-dark) text-center py-6">{t('admin.empty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-center border-b border-(--gold-dark)/30 text-(--gold-light) uppercase tracking-wider text-xs">
                  <th className="py-3 pr-4">#</th>
                  <th className="pr-4">{t('admin.name')}</th>
                  <th className="pr-4">{t('admin.phone')}</th>
                  <th className="pr-4">{t('admin.paid')}</th>
                  <th className="pr-4">{t('admin.reservedAt')}</th>
                  <th className="text-center">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => {
                  const isBusy = busy === ticket.number
                  return (
                    <tr
                      key={ticket.number}
                      className="text-center border-b border-(--gold-dark)/20 hover:bg-(--bg-base)/40 transition"
                    >
                      <td className="py-3 pr-4 font-mono text-(--gold-mid) font-bold">
                        {ticket.number}
                      </td>
                      <td className="pr-4 text-(--gold-light)">{ticket.name}</td>
                      <td className="pr-4 text-(--gold-dark)">{ticket.phone}</td>
                      <td className="pr-4">
                        <button
                          onClick={() => togglePaid(ticket)}
                          disabled={isBusy}
                          className={`px-2 py-0.5 rounded text-xs font-bold transition ${
                            ticket.paid
                              ? 'bg-(--gold-mid) text-(--bg-base) hover:bg-(--gold-light)'
                              : 'bg-(--bg-base) text-(--gold-dark) border border-(--gold-dark) hover:border-(--gold-mid) hover:text-(--gold-mid)'
                          } ${isBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                          {ticket.paid ? t('admin.paidYes') : t('admin.paidNo')}
                        </button>
                      </td>
                      <td className="pr-4 text-xs text-(--gold-dark)">
                        {ticket.reserved_at ? new Date(ticket.reserved_at).toLocaleString() : '—'}
                      </td>
                      <td className="text-left">
                        <div className="flex justify-center">
                          <IoTrashBinSharp
                            size={18}
                            onClick={() => removeTicket(ticket.number)}
                            className={`text-red-500 hover:text-red-300 transition ${isBusy ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                          />
                        </div>
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

export default AdminDashboard

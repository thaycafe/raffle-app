import { Fragment, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoTrashBinSharp, IoChevronDown, IoChevronForward } from 'react-icons/io5'

import LanguageToggle from '../components/shared/LanguageToggle'
import { getAuth, authHeader, clearAuth } from '../service/auth'

type AdminTicket = {
  number: number
  name: string
  phone: string
  paid: boolean
  reserved_at: string | null
}

type TicketGroup = {
  key: string
  name: string
  phone: string
  tickets: AdminTicket[]
  paidCount: number
  totalCount: number
  lastReservedAt: string | null
}

function AdminDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<number | null>(null)
  const [busyGroup, setBusyGroup] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

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

  const groups = useMemo<TicketGroup[]>(() => {
    const map = new Map<string, TicketGroup>()
    for (const ticket of tickets) {
      const key = `${ticket.name}|${ticket.phone}`
      const existing = map.get(key)
      if (existing) {
        existing.tickets.push(ticket)
        if (ticket.paid) existing.paidCount += 1
        existing.totalCount += 1
        if (
          ticket.reserved_at &&
          (!existing.lastReservedAt || ticket.reserved_at > existing.lastReservedAt)
        ) {
          existing.lastReservedAt = ticket.reserved_at
        }
      } else {
        map.set(key, {
          key,
          name: ticket.name,
          phone: ticket.phone,
          tickets: [ticket],
          paidCount: ticket.paid ? 1 : 0,
          totalCount: 1,
          lastReservedAt: ticket.reserved_at,
        })
      }
    }
    const result = Array.from(map.values())
    for (const g of result) g.tickets.sort((a, b) => a.number - b.number)
    result.sort((a, b) => (b.lastReservedAt ?? '').localeCompare(a.lastReservedAt ?? ''))
    return result
  }, [tickets])

  const toggleExpand = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const togglePaid = async (ticket: AdminTicket) => {
    setBusy(ticket.number)
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.number}/paid`, {
        method: 'PATCH',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
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

  const markGroupPaid = async (group: TicketGroup) => {
    const unpaid = group.tickets.filter((tk) => !tk.paid)
    if (unpaid.length === 0) return
    if (!confirm(t('admin.confirmMarkAllPaid', { name: group.name, count: unpaid.length }))) return
    setBusyGroup(group.key)
    try {
      await Promise.all(
        unpaid.map((tk) =>
          fetch(`/api/admin/tickets/${tk.number}/paid`, {
            method: 'PATCH',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ paid: true }),
          }),
        ),
      )
      await loadTickets()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setBusyGroup(null)
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
              {groups.length} {t('admin.people')} · {tickets.length} {t('admin.reservations')}
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

          {groups.length === 0 ? (
            <p className="text-(--gold-dark) text-center py-6">{t('admin.empty')}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-center border-b border-(--gold-dark)/30 text-(--gold-light) uppercase tracking-wider text-xs">
                  <th className="py-3 pr-2 w-8"></th>
                  <th className="pr-4">{t('admin.name')}</th>
                  <th className="pr-4">{t('admin.phone')}</th>
                  <th className="pr-4">{t('admin.numbers')}</th>
                  <th className="pr-4">{t('admin.paid')}</th>
                  <th className="pr-4">{t('admin.reservedAt')}</th>
                  <th className="text-center">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => {
                  const isOpen = expanded.has(group.key)
                  const isGroupBusy = busyGroup === group.key
                  const allPaid = group.paidCount === group.totalCount
                  return (
                    <Fragment key={group.key}>
                      <tr
                        className="text-center border-b border-(--gold-dark)/20 hover:bg-(--bg-base)/40 transition cursor-pointer"
                        onClick={() => toggleExpand(group.key)}
                      >
                        <td className="py-3 pr-2 text-(--gold-mid)">
                          {isOpen ? (
                            <IoChevronDown size={16} className="inline" />
                          ) : (
                            <IoChevronForward size={16} className="inline" />
                          )}
                        </td>
                        <td className="pr-4 text-(--gold-light) font-semibold">{group.name}</td>
                        <td className="pr-4 text-(--gold-dark)">{group.phone}</td>
                        <td className="pr-4 font-mono text-(--gold-mid) text-xs">
                          {group.tickets.map((tk) => tk.number).join(', ')}
                        </td>
                        <td className="pr-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              allPaid
                                ? 'bg-(--gold-mid) text-(--bg-base)'
                                : 'bg-(--bg-base) text-(--gold-dark) border border-(--gold-dark)'
                            }`}
                          >
                            {group.paidCount}/{group.totalCount} {t('admin.paidYes')}
                          </span>
                        </td>
                        <td className="pr-4 text-xs text-(--gold-dark)">
                          {group.lastReservedAt
                            ? new Date(group.lastReservedAt).toLocaleString()
                            : '—'}
                        </td>
                        <td className="text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => markGroupPaid(group)}
                            disabled={allPaid || isGroupBusy}
                            className={`px-2 py-1 rounded text-xs font-medium border transition ${
                              allPaid
                                ? 'opacity-30 cursor-not-allowed border-(--gold-dark) text-(--gold-dark)'
                                : 'border-(--gold-mid) text-(--gold-mid) hover:bg-(--gold-mid) hover:text-(--bg-base) cursor-pointer'
                            } ${isGroupBusy ? 'opacity-50 cursor-wait' : ''}`}
                          >
                            {t('admin.markAllPaid')}
                          </button>
                        </td>
                      </tr>
                      {isOpen &&
                        group.tickets.map((ticket) => {
                          const isBusy = busy === ticket.number
                          return (
                            <tr
                              key={`${group.key}-${ticket.number}`}
                              className="text-center border-b border-(--gold-dark)/10 bg-(--bg-base)/20"
                            >
                              <td></td>
                              <td></td>
                              <td></td>
                              <td className="py-2 pr-4 font-mono text-(--gold-mid) font-bold">
                                #{ticket.number}
                              </td>
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
                                {ticket.reserved_at
                                  ? new Date(ticket.reserved_at).toLocaleString()
                                  : '—'}
                              </td>
                              <td>
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
                    </Fragment>
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
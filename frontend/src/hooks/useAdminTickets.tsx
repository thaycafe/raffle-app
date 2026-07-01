import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

import { clearAuth, getAuth } from '../service/auth'
import {
  ApiError,
  deleteAdminTicket,
  fetchAdminTickets,
  patchTicketPaid,
} from '../service/adminApi'
import type { AdminTicket, TicketGroup } from '../types/admin'

export function useAdminTickets() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [inUse, setInUse] = useState<number | null>(null)
  const [busyGroup, setBusyGroup] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const handleError = useCallback(
    (e: unknown, fallback: string) => {
      if (e instanceof ApiError && e.status === 401) {
        clearAuth()
        navigate('/admin/login')
        return
      }
      toast.error(e instanceof Error ? e.message : fallback)
    },
    [navigate]
  )

  const loadTickets = useCallback(async () => {
    try {
      setTickets(await fetchAdminTickets())
    } catch (e) {
      handleError(e, t('admin.errors.loadFailed'))
    }
  }, [handleError, t])

  useEffect(() => {
    if (!getAuth()) {
      navigate('/admin/login')
      return
    }
    void loadTickets()
  }, [])


  const togglePaid = useCallback(
    async (ticket: AdminTicket) => {
      setInUse(ticket.number)
      try {
        await patchTicketPaid(ticket.number, !ticket.paid)
        toast.success(
          t(ticket.paid ? 'admin.toast.markedUnpaid' : 'admin.toast.markedPaid', {
            number: ticket.number,
          })
        )
        await loadTickets()
      } catch (e) {
        handleError(e, t('admin.errors.updateFailed'))
      } finally {
        setInUse(null)
      }
    },
    [handleError, loadTickets, t]
  )

  const removeTicket = useCallback(
    async (number: number) => {
      setInUse(number)
      try {
        await deleteAdminTicket(number)
        toast.success(t('admin.toast.deleted', { number }))
        await loadTickets()
        return true
      } catch (e) {
        handleError(e, t('admin.errors.deleteFailed'))
        return false
      } finally {
        setInUse(null)
      }
    },
    [handleError, loadTickets, t]
  )

  const markGroupPaid = useCallback(
    async (group: TicketGroup) => {
      const unpaid = group.tickets.filter((tk) => !tk.paid)
      if (unpaid.length === 0) return false
      setBusyGroup(group.key)
      try {
        await Promise.all(unpaid.map((tk) => patchTicketPaid(tk.number, true)))
        toast.success(t('admin.toast.groupPaid', { name: group.name, count: unpaid.length }))
        await loadTickets()
        return true
      } catch (e) {
        handleError(e, t('admin.errors.updateFailed'))
        return false
      } finally {
        setBusyGroup(null)
      }
    },
    [handleError, loadTickets, t]
  )

  const removeGroupTickets = useCallback(
    async (group: TicketGroup) => {
      setBusyGroup(group.key)
      try {
        await Promise.all(group.tickets.map((tk) => deleteAdminTicket(tk.number)))
        toast.success(
          t('admin.toast.groupDeleted', {
            name: group.name,
            count: group.tickets.length,
          })
        )
        await loadTickets()
        return true
      } catch (e) {
        handleError(e, t('admin.errors.deleteFailed'))
        return false
      } finally {
        setBusyGroup(null)
      }
    },
    [handleError, loadTickets, t]
  )

  const toggleExpand = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
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

  return {
    tickets,
    groups,
    inUse,
    busyGroup,
    expanded,
    togglePaid,
    removeTicket,
    markGroupPaid,
    removeGroupTickets,
    toggleExpand,
  }
}

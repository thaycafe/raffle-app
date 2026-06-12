import type { AdminTicket, DrawResult } from '../types/admin'
import { authHeader } from './auth'

// ─── Typed error class ────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Response helper ──────────────────────────────────────────────────────────
async function handle<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new ApiError(401, 'Unauthorized')
  if (!res.ok) {
    const body: { detail?: string } = await res.json().catch(() => ({}))
    throw new ApiError(res.status, body.detail ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as Promise<T>
}

export const fetchAdminTickets = (): Promise<AdminTicket[]> =>
  fetch('/api/admin/tickets', { headers: authHeader() }).then(handle<AdminTicket[]>)

export const patchTicketPaid = (number: number, paid: boolean): Promise<AdminTicket> =>
  fetch(`/api/admin/tickets/${number}/paid`, {
    method: 'PATCH',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ paid }),
  }).then(handle<AdminTicket>)

export const deleteAdminTicket = (number: number): Promise<void> =>
  fetch(`/api/admin/tickets/${number}`, {
    method: 'DELETE',
    headers: authHeader(),
  }).then(handle<void>)

export const drawWinners = (winners = 1): Promise<DrawResult[]> =>
  fetch(`/api/admin/draw?winners=${winners}`, {
    method: 'POST',
    headers: authHeader(),
  }).then(handle<DrawResult[]>)

import type { Config, ReserveResponse, Ticket } from '../types'

export const fetchConfig = (): Promise<Config> =>
  fetch('/api/config').then((r) => r.json())

export const fetchTickets = (): Promise<Ticket[]> =>
  fetch('/api/tickets').then((r) => r.json())

/**
 * @param {number[]} numbers   - numbers list to be reserved
 * @param {string}   name      - username
 * @param {string}   phone     - user telephone number
 * @returns {Promise<{reserved: number[]}>}
 */
export const reserveTickets = (
  numbers: number[],
  name: string,
  phone: string,
): Promise<Response> =>
  fetch('/api/reserve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numbers, name, phone }),
  })

export const parseReserveResponse = (res: Response): Promise<ReserveResponse> =>
  res.json()

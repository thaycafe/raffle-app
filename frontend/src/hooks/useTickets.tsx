import { useEffect, useState } from 'react'
import { fetchConfig, fetchTickets, parseReserveResponse, reserveTickets } from '../service/api'
import type { Config, SuccessState, Ticket } from '../types'

export type UseTicketsReturn = {
  config: Config | null
  tickets: Ticket[]
  selected: number[]
  success: SuccessState | null
  toggleNumber: (n: number) => void
  reserve: (name: string, phone: string) => Promise<void>
}

export function useTickets(): UseTicketsReturn {
  const [config, setConfig] = useState<Config | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([] as Ticket[])
  const [selected, setSelected] = useState<number[]>([] as number[])
  const [success, setSuccess] = useState<SuccessState | null>(null)

  const loadTickets = () => fetchTickets().then(setTickets)

  useEffect(() => {
    fetchConfig().then(setConfig)
    loadTickets()
  }, [])

  const toggleNumber = (number: number): void => {
    setSelected((prev: number[]) =>
      prev.includes(number) ? prev.filter((n: number) => n !== number) : [...prev, number],
    )
  }

  const reserve = async (name: string, phone: string): Promise<void> => {
    const res = await reserveTickets(selected, name, phone)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.detail ?? 'Reservation failed')
    }

    const data = await parseReserveResponse(res)
    setSuccess({ numbers: data.reserved, name })
    setSelected([])
    loadTickets()
  }

  return { config, tickets, selected, success, toggleNumber, reserve }
}
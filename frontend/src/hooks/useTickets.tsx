import { useEffect, useState } from 'react'
import { fetchConfig, fetchTickets, parseReserveResponse, reserveTickets } from '../service/api'
import type { Configuration, Ticket } from '../types/home'
import type { SuccessState, UseTicketsReturn } from '../types/api'

export function useTickets(): UseTicketsReturn {
  const [config, setConfig] = useState<Configuration | null>(null)
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
      prev.includes(number) ? prev.filter((n: number) => n !== number) : [...prev, number]
    )
  }

  const reserve = async (name: string, phone: string): Promise<void> => {
    const response = await reserveTickets(selected, name, phone)

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.detail ?? 'Reservation failed')
    }

    const data = await parseReserveResponse(response)
    setSuccess({ numbers: data.reserved, name })
    setSelected([])
    loadTickets()
  }

  return { config, tickets, selected, success, toggleNumber, reserve }
}

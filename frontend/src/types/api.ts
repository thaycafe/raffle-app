import type { Configuration, Ticket } from './home'

export type SuccessState = {
  numbers: number[]
  name: string
}

export type ReserveResponse = {
  reserved: number[]
}

export type UseTicketsReturn = {
  config: Configuration | null
  tickets: Ticket[]
  selected: number[]
  success: SuccessState | null
  toggleNumber: (n: number) => void
  reserve: (name: string, phone: string) => Promise<void>
}

export type AdminTicket = {
  number: number
  name: string
  phone: string
  paid: boolean
  reserved_at: string | null
}

export type DrawResult = {
  position: number
  number: number
  name: string
  phone: string
}

export type TicketGroup = {
  key: string
  name: string
  phone: string
  tickets: AdminTicket[]
  paidCount: number
  totalCount: number
  lastReservedAt: string | null
}

export type DeleteTarget =
  | { type: 'single'; ticket: AdminTicket }
  | { type: 'delete-group'; group: TicketGroup }
  | { type: 'mark-paid'; group: TicketGroup }

export type DeleteModalData = {
  title: string
  message: string
  isLoading: boolean
  variant: 'danger' | 'primary'
}

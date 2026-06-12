export type Ticket = {
  number: number
  taken: boolean
}

export type Configuration = {
  price: number
  currency: string
  total_numbers: number
}

export type Prize = {
  position: string
  title: string
  description?: string
}

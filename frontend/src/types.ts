export type Ticket = {
  number: number
  taken: boolean
}

export type Config = {
  price: number
  currency: string
  total_numbers: number
}

export type Prize = {
  position: string
  title: string
  description?: string
}

export type SuccessState = {
  numbers: number[]
  name: string
}

export type ReserveResponse = {
  reserved: number[]
}


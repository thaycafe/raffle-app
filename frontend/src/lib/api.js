export const fetchConfig = () =>
  fetch('/api/config').then(r => r.json())

export const fetchTickets = () =>
  fetch('/api/tickets').then(r => r.json())

/**
 * @param {number[]} numbers   - lista de números em reserva
 * @param {string}   name      - nome do participante
 * @param {string}   phone     - telefone do participante
 * @returns {Promise<{reserved: number[]}>}
 */
export const reserveTickets = (numbers, name, phone) =>
  fetch('/api/reserve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ numbers, name, phone }),
  })


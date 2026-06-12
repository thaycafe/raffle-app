import type { Ticket } from '../../types/home'
import styles from './TicketGrid.module.css'

type Props = {
  tickets: Ticket[]
  selected: number[]
  onToggle: (number: number) => void
}

export default function TicketGrid({ tickets, selected, onToggle }: Props) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {tickets.map((ticket) => {
        const isSelected = selected.includes(ticket.number)

        if (ticket.taken) {
          return (
            <div
              key={ticket.number}
              className="aspect-square flex items-center justify-center rounded-lg text-sm font-medium bg-(--bg-base) text-(--gold-dark)/40 cursor-not-allowed line-through border border-(--gold-dark)/20"
            >
              {ticket.number}
            </div>
          )
        }

        return (
          <button
            key={ticket.number}
            onClick={() => onToggle(ticket.number)}
            className={`aspect-square focus:outline-none ${styles['flip-card']}`}
            aria-pressed={isSelected}
            aria-label={`Número ${ticket.number}`}
          >
            <div className={`${styles['flip-card-inner']} ${isSelected ? styles['flipped'] : ''}`}>
              <span className={styles['flip-card-front']}>{ticket.number}</span>
              <span className={styles['flip-card-back']}>{ticket.number}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default function TicketGrid({ tickets, selected, onToggle }) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
      {tickets.map(ticket => {
        const isSelected = selected.includes(ticket.number)

        if (ticket.taken) {
          return (
            <div
              key={ticket.number}
              className="aspect-square flex items-center justify-center rounded-lg text-sm font-medium bg-[#0c0f14] text-[#D96225]/30 cursor-not-allowed line-through border border-[#D96225]/10"
            >
              {ticket.number}
            </div>
          )
        }

        return (
          <button
            key={ticket.number}
            onClick={() => onToggle(ticket.number)}
            className="aspect-square flip-card focus:outline-none"
            aria-pressed={isSelected}
            aria-label={`Número ${ticket.number}`}
          >
            <div className={`flip-card-inner ${isSelected ? 'flipped' : ''}`}>
              <span className="flip-card-front">{ticket.number}</span>
              <span className="flip-card-back">{ticket.number}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

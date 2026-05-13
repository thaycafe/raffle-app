import { useEffect, useState } from 'react'

function App() {
  const [config, setConfig] = useState(null)
  const [tickets, setTickets] = useState([])

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(setConfig)

    fetch('/api/tickets')
      .then(r => r.json())
      .then(setTickets)
  }, [])

  if (!config) return <p>A carregar...</p>

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h1>{config.title}</h1>
      <p>Prémio: {config.prize}</p>
      <p>Preço: {config.price} {config.currency}</p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gap: 8,
      }}>
        {tickets.map(t => (
          <div
            key={t.number}
            style={{
              padding: 10,
              textAlign: 'center',
              border: '1px solid #ccc',
              borderRadius: 4,
              background: t.taken ? '#fee' : '#efe',
              textDecoration: t.taken ? 'line-through' : 'none',
            }}
          >
            {t.number}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
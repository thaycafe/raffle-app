import { useEffect, useState } from 'react'

function App() {
  const [config, setConfig] = useState(null)
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const loadTickets = () => {
    fetch('/api/tickets')
      .then(r => r.json())
      .then(setTickets)
  }

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setConfig)
    loadTickets()
  }, [])

  const handleSubmit = async () => {
    if (!selected || !name.trim() || !phone.trim()) {
      setError('Pick a number and fill in name and phone.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: selected, name, phone }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || 'Reservation failed')
      }

      setSuccess({ number: selected, name })
      setSelected(null)
      setName('')
      setPhone('')
      loadTickets()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    )
  }

  const takenCount = tickets.filter(t => t.taken).length
  const availableCount = config.total_numbers - takenCount

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{config.title}</h1>
          <p className="text-slate-600 mt-2">
            Prize: <span className="font-semibold text-slate-900">{config.prize}</span>
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
              {config.price} {config.currency} per ticket
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {availableCount} available
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
              {takenCount} / {config.total_numbers} taken
            </span>
          </div>
        </header>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl mb-6">
            Number <strong>{success.number}</strong> reserved for <strong>{success.name}</strong>.
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">Pick a number</h2>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {tickets.map(t => {
              const isSelected = selected === t.number
              const base = 'aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition'

              if (t.taken) {
                return (
                  <div
                    key={t.number}
                    className={`${base} bg-slate-100 text-slate-400 cursor-not-allowed line-through`}
                  >
                    {t.number}
                  </div>
                )
              }

              return (
                <button
                  key={t.number}
                  onClick={() => setSelected(t.number)}
                  className={`${base} ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
                      : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-indigo-50'
                  }`}
                >
                  {t.number}
                </button>
              )
            })}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-slate-900">
            Your details {selected && <span className="text-indigo-600">(number {selected})</span>}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="tel"
              placeholder="Phone (MBWay)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={submitting || !selected}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
          >
            {submitting ? 'Reserving...' : 'Reserve number'}
          </button>
        </section>
      </div>
    </div>
  )
}

export default App
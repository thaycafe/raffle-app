import { useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { Link } from 'react-router-dom'
import LanguageToggle from './components/LanguageToggle'
import TicketGrid from './components/TicketGrid'
import ReservationForm from './components/ReservationForm'
import { useTickets } from './hooks/useTickets'

function App() {
  const { t, i18n } = useTranslation()

  const {
    config,
    tickets,
    selected,
    toggleNumber,
    name,
    setName,
    phone,
    handlePhoneChange,
    submitting,
    error,
    success,
    handleSubmit,
  } = useTickets()

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage
  }, [i18n.resolvedLanguage])

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-yellow-400">
        {t('loading')}
      </div>
    )
  }

  const takenCount = tickets.filter(t => t.taken).length
  const availableCount = config.total_numbers - takenCount
  const prizes = t('raffle.items', { returnObjects: true })

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>
        <header className="bee-header rounded-2xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-yellow-100/80">{t('raffle.title')}</h1>

          <p className="font-futura-regular text-white text-sm mt-2 mb-1 leading-relaxed">
            {t('raffle.description')}
          </p>

          <div className="mt-4">
            <p className="text-yellow-100/80 font-semibold mb-2 uppercase tracking-wide text-xs">
              {t('header.prizes')}
            </p>
            <ol className="space-y-2">
              {prizes.map((prize, index) => (
                <li key={index} className="flex items-baseline gap-2">
                  <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-yellow-600 text-yellow-50 rounded-full text-xs font-bold">
                    {prize.position}
                  </span>
                  <span>
                    <span className="font-futura-regular font-bold text-[#da8326]">
                      {prize.title}
                    </span>
                    {prize.description && (
                      <span className="text-yellow-100/80 text-sm font-futura-book">
                        {' '}
                        — {prize.description}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-3 py-1 bg-[#da8326] text-[#0c0f14] rounded-full text-sm font-bold">
              {config.price} {config.currency} {t('header.perTicket')}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {availableCount} {t('header.available')}
            </span>
            <span className="px-3 py-1 bg-[#0c0f14] text-[#da8326] rounded-full text-sm font-medium border border-[#da8326]/40">
              {takenCount} / {config.total_numbers} {t('header.taken')}
            </span>
          </div>
        </header>

        {success && (
          <div className="bg-green-900/40 border border-green-400 text-green-100 p-4 rounded-xl mb-6">
            <Trans
              i18nKey="success.reservedMultiple"
              values={{ numbers: success.numbers.join(', '), name: success.name }}
              components={{ 0: <strong /> }}
            />
          </div>
        )}

        <section className="bg-[#0c0f14] rounded-2xl shadow-sm p-6 mb-6 border border-[#D96225]/30">
          <h2 className="text-xl font-bold mb-4 text-[#da8326]">{t('pickNumber')}</h2>
          <TicketGrid tickets={tickets} selected={selected} onToggle={toggleNumber} />
        </section>

        <ReservationForm
          selected={selected}
          config={config}
          name={name}
          setName={setName}
          phone={phone}
          handlePhoneChange={handlePhoneChange}
          submitting={submitting}
          error={error}
          onSubmit={handleSubmit}
        />

        <footer className="mt-8 text-center">
          <Link
            to="/admin/login"
            className="text-xs text-slate-500 hover:text-yellow-400 transition"
          >
            {t('footer.admin')}
          </Link>
        </footer>
      </div>
    </div>
  )
}

export default App
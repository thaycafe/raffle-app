import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import LanguageToggle from './components/shared/LanguageToggle'
import TicketGrid from './components/tickets/TicketGrid'
import ReservationForm from './components/ReservationForm'
import FloatingParticles from './components/shared/FloatingParticles'
import { useTickets } from './hooks/useTickets'
import Header from './components/shared/Header'
import Prize from './components/shared/Prize'

function App() {
  const { t, i18n } = useTranslation()
  const { config, tickets, selected, toggleNumber, reserve, success } = useTickets()

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? 'pt'
  }, [i18n.resolvedLanguage])

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-(--gold-mid)">
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <FloatingParticles count={22} />
      <div className="relative max-w-3xl mx-auto" style={{ zIndex: 10 }}>
        <div className="flex justify-end mb-2">
          <LanguageToggle />
        </div>

        <Header config={config} tickets={tickets} />
        <Prize />

        {success && (
          <div className="bg-(--bg-surface) border border-(--gold-mid)/50 text-(--gold-light) p-4 rounded-xl mb-6">
            <Trans
              i18nKey="success.reservedMultiple"
              values={{ numbers: success.numbers.join(', '), name: success.name }}
              components={{ 0: <strong className="text-(--gold-mid)" /> }}
            />
          </div>
        )}

        <section className="bg-(--bg-surface) rounded-2xl shadow-sm p-6 mb-6 border border-(--gold-dark)/50">
          <h2 className="text-xl font-bold mb-4 text-(--gold-mid)">{t('pickNumber')}</h2>
          <TicketGrid tickets={tickets} selected={selected} onToggle={toggleNumber} />
        </section>

        <ReservationForm selected={selected} config={config} onReserve={reserve} />

        <footer className="mt-8 text-center">
          <Link
            to="/admin/login"
            className="text-xs text-(--gold-dark) hover:text-(--gold-mid) transition"
          >
            {t('footer.admin')}
          </Link>
        </footer>
      </div>
    </div>
  )
}

export default App

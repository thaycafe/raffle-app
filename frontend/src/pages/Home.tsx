import LanguageToggle from '../components/shared/LanguageToggle'
import Header from '../components/Header'
import Prize from '../components/Prize'
import TicketGrid from '../components/tickets/TicketGrid'
import ReservationForm from '../components/ReservationForm'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTickets } from '../hooks/useTickets'

function Home(props: any) {
  const { config } = props
  const { t } = useTranslation()
  const { tickets, selected, toggleNumber, reserve } = useTickets()

  return (
    <div className="relative max-w-3xl mx-auto" style={{ zIndex: 10 }}>
      <div className="flex justify-end mb-2">
        <Link
          to="/admin/login"
          className="text-md text-(--gold-light) hover:text-(--gold-whisper) transition self-center mr-4"
        >
          {t('footer.admin')}
        </Link>
        <LanguageToggle />
      </div>
      <Header config={config} tickets={tickets} />
      <Prize />

      <section className="bg-(--bg-surface) rounded-2xl shadow-sm p-6 mb-6 border border-(--gold-dark)/50">
        <h2 className="text-xl font-bold mb-4 text-(--gold-mid)">{t('pickNumber')}</h2>
        <TicketGrid tickets={tickets} selected={selected} onToggle={toggleNumber} />
      </section>

      <ReservationForm selected={selected} config={config} onReserve={reserve} />
    </div>
  )
}

export default Home

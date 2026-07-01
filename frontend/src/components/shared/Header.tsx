import { useTranslation } from 'react-i18next'
import type { Config, Ticket } from '../../types'

type Props = {
  config: Config
  tickets: Ticket[]
}

export default function Header({config, tickets}: Props) {
  const { t } = useTranslation()

  const takenCount = tickets.filter((ticket) => ticket.taken).length
  const availableCount = config?.total_numbers - takenCount

  return (
    <header className="bee-header rounded-2xl shadow-sm p-6 mb-6">
      <h1 className="title-shimmer text-3xl font-bold">{t('raffle.title')}</h1>

      <p className="font-futura-regular text-(--gold-whisper) text-sm mt-2 mb-1 leading-relaxed">
        {t('raffle.description')}
      </p>

      <div className="flex flex-wrap gap-2 mt-5">
        <span className="px-3 py-1 bg-(--gold-mid) text-(--bg-base) rounded-full text-sm font-bold">
          {config.price} {config.currency} {t('header.perTicket')}
        </span>
        <span className="px-3 py-1 bg-(--gold-dark) text-(--gold-light) rounded-full text-sm font-medium">
          {availableCount} {t('header.available')}
        </span>
        <span className="px-3 py-1 bg-(--bg-base) text-(--gold-mid) rounded-full text-sm font-medium border border-(--gold-dark)">
          {takenCount} / {config.total_numbers} {t('header.taken')}
        </span>
      </div>
    </header>
  )
}
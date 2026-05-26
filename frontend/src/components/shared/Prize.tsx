import type { Prize } from '../../types'
import { useTranslation } from 'react-i18next'

export default function Prize(){
  const { t } = useTranslation()
  const rawPrizes = t('raffle.items', { returnObjects: true })
  const prizes: Prize[] = Array.isArray(rawPrizes) ? (rawPrizes as Prize[]) : []

  return (
    <section className="bee-header rounded-2xl shadow-sm p-6 mb-6">
      <p className="text-(--gold-mid) font-semibold mb-2 uppercase tracking-widest text-md">
        {t('header.prizes')}
      </p>
      <ol className="space-y-2">
        {prizes.map((prize, index) => (
          <li key={index} className="flex items-baseline gap-2">
            <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-(--gold-dark) text-(--gold-light) rounded-full text-xs font-bold">
              {prize.position}
            </span>
            <span>
              <span className="font-futura-regular font-bold text-(--gold-whisper)">
                {prize.title}
              </span>
              {prize.description && (
                <span className="font-futura-book text-(--gold-light) text-sm">
                  {' '}
                  — {prize.description}
                </span>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
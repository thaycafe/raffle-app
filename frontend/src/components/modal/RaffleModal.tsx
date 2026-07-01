import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Prize } from '../../types/home'

type RaffleModalProps = {
  open: boolean
  onClose: () => void
  drawnIndexes: number[]
  defaultSelectedIndex?: number | null
  onResetPrize?: (position: number) => void
  onDraw?: (prize: Prize, position: number) => void
}

export default function RaffleModal({
  open,
  onClose,
  drawnIndexes,
  defaultSelectedIndex = null,
  onResetPrize,
  onDraw,
}: RaffleModalProps) {
  const { t } = useTranslation()
  const rawPrizes = t('raffle.items', { returnObjects: true })
  const prizes: Prize[] = Array.isArray(rawPrizes) ? (rawPrizes as Prize[]) : []

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    setSelectedIndex(defaultSelectedIndex)
  }, [defaultSelectedIndex, open])

  const selectedPrize = useMemo(
    () => (selectedIndex !== null ? prizes[selectedIndex] : null),
    [prizes, selectedIndex]
  )
  const canReset = useMemo(
    () =>
      selectedIndex !== null &&
      drawnIndexes.includes(Number(prizes[selectedIndex]?.position) || selectedIndex + 1),
    [selectedIndex, drawnIndexes, prizes]
  )

  const handleClose = () => {
    onClose()
  }

  const handleReset = () => {
    if (selectedIndex === null) return
    const selectedPrize = prizes[selectedIndex]
    const position = Number(selectedPrize?.position) || selectedIndex + 1
    onResetPrize?.(position)
  }

  const handleDraw = () => {
    if (selectedIndex === null || !selectedPrize) return
    const position = Number(selectedPrize.position) || selectedIndex + 1
    if (drawnIndexes.includes(position)) return
    onDraw?.(selectedPrize, position)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-200 ${
        open
          ? 'bg-black/75 backdrop-blur-[1px] opacity-100'
          : 'pointer-events-none bg-transparent opacity-0'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-3xl rounded-2xl border border-(--gold-light) bg-[linear-gradient(160deg,#2a1f0f_0%,#1e170b_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.78)] transition-all duration-200 ${
          open ? 'scale-100 translate-y-0' : 'scale-95 translate-y-3'
        }`}
      >
        <h2 className="text-xl font-bold text-(--gold-whisper) tracking-wide">
          {t('admin.raffleModal.title')}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#f1da9b]">{t('admin.raffleModal.message')}</p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {prizes.map((prize, index) => {
            const selected = selectedIndex === index
            const position = Number(prize.position) || index + 1
            const drawn = drawnIndexes.includes(position)
            return (
              <button
                key={`${prize.position}-${prize.title}`}
                type="button"
                onClick={() => setSelectedIndex((prev) => (prev === index ? null : index))}
                className={`rounded-xl border p-4 text-left transition duration-200 hover:scale-[1.03] hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)] ${
                  selected
                    ? 'border-(--gold-whisper) bg-[linear-gradient(150deg,rgba(201,150,60,0.4)_0%,rgba(122,92,30,0.45)_100%)] ring-2 ring-(--gold-whisper)/70'
                    : 'border-(--gold-mid)/70 bg-[rgba(255,243,196,0.06)] hover:border-(--gold-light)'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-(--gold-whisper) font-bold">{prize.position}</span>
                  {drawn && (
                    <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-(--gold-whisper) text-(--bg-base)">
                      {t('admin.raffleModal.drawn')}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-semibold text-(--gold-whisper)">{prize.title}</p>
                {prize.description && (
                  <p className="mt-1 text-sm text-[#f1da9b]">{prize.description}</p>
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleReset}
            disabled={!canReset}
            className="rounded-lg border border-(--gold-mid) bg-[rgba(255,243,196,0.08)] px-4 py-2 text-sm font-medium text-(--gold-light) transition hover:border-(--gold-light) hover:bg-[rgba(255,243,196,0.16)] disabled:opacity-40"
          >
            {t('admin.raffleModal.reset')}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-(--gold-mid) bg-[rgba(255,243,196,0.08)] px-4 py-2 text-sm font-medium text-(--gold-light) transition hover:border-(--gold-light) hover:bg-[rgba(255,243,196,0.16)]"
          >
            {t('admin.raffleModal.cancel')}
          </button>
          <button
            type="button"
            onClick={handleDraw}
            disabled={
              selectedIndex === null ||
              drawnIndexes.includes(Number(selectedPrize?.position) || selectedIndex + 1)
            }
            className="rounded-lg border border-(--gold-whisper) bg-[linear-gradient(135deg,var(--gold-mid)_0%,var(--gold-whisper)_100%)] px-4 py-2 text-sm font-semibold text-(--bg-base) transition hover:brightness-110 disabled:opacity-40"
          >
            {t('admin.raffleModal.draw')}
          </button>
        </div>
      </div>
    </div>
  )
}

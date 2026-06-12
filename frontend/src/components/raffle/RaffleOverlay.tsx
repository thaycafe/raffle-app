import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useTranslation } from 'react-i18next'
import { PCFShadowMap } from 'three'
import type { Prize } from '../../types/home'
import type { DrawResult } from '../../types/admin'
import { drawWinners } from '../../service/adminApi'
import ConfirmationModal from '../modal/ConfirmationModal'
import { saveDrawnPrize } from '../../utils/raffleStorage'
import RaffleGiftBoxScene, {
  LID_OPEN_DURATION_SECONDS,
  SHAKE_DURATION_SECONDS,
} from './RaffleGiftBoxScene'

type RaffleOverlayProps = {
  open: boolean
  onBackToPrizeSelection: () => void
  prize: Prize | undefined
  prizeNumber: number | null
}

export default function RaffleOverlay({ open, onBackToPrizeSelection, prize, prizeNumber }: RaffleOverlayProps) {
  const { t } = useTranslation()
  const [winnerData, setWinnerData] = useState<DrawResult | null>(null)
  const [animationRunId, setAnimationRunId] = useState(0)
  const [isWinnerCardVisible, setIsWinnerCardVisible] = useState(false)
  const [isWinnerCardContentVisible, setIsWinnerCardContentVisible] = useState(false)
  const [keepWinnerModalOpen, setKeepWinnerModalOpen] = useState(false)
  const [isDrawReadyToConfirm, setIsDrawReadyToConfirm] = useState(false)

  const startDrawAnimation = () => {
    setAnimationRunId((prev) => prev + 1)
    setWinnerData(null)
    setIsWinnerCardVisible(false)
    setIsWinnerCardContentVisible(false)
    setIsDrawReadyToConfirm(false)

    const showCardTimer = window.setTimeout(
      () => setIsWinnerCardVisible(true),
      (SHAKE_DURATION_SECONDS + LID_OPEN_DURATION_SECONDS) * 1000
    )
    const showContentTimer = window.setTimeout(
      () => {
        setIsWinnerCardContentVisible(true)
        setIsDrawReadyToConfirm(true)
      },
      (SHAKE_DURATION_SECONDS + LID_OPEN_DURATION_SECONDS + 1.35) * 1000
    )

    void drawWinners(1).then((results) => {
      const winnerFromBackend = results?.[0]
      if (!winnerFromBackend) return

      setWinnerData(winnerFromBackend)
    })

    return () => {
      window.clearTimeout(showCardTimer)
      window.clearTimeout(showContentTimer)
    }
  }

  useEffect(() => {
    if (!open) return
    return startDrawAnimation()
  }, [open])

  const handleKeepWinnerNo = () => {
    setKeepWinnerModalOpen(false)
    onBackToPrizeSelection()
  }

  const handleBackToPrizeSelection = () => {
    if (winnerData && isDrawReadyToConfirm) {
      setKeepWinnerModalOpen(true)
      return
    }
    onBackToPrizeSelection()
  }

  const handleKeepWinnerYes = async () => {
    setKeepWinnerModalOpen(false)
    if (!winnerData || !prizeNumber) {
      onBackToPrizeSelection()
      return
    }

    saveDrawnPrize(winnerData, prizeNumber)
    onBackToPrizeSelection()
  }

  const onClose = () => {
    handleBackToPrizeSelection()
  }

  return (
    <div
      className={`fixed inset-0 z-70 flex items-center justify-center px-3 transition-all duration-300 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-[1px]" onClick={onClose} />

      <div className="relative w-full max-w-5xl rounded-2xl bg-(--bg-surface)/80 p-4 md:p-6">
        <div className="-mt-1 mb-2 text-center">
          <p className="text-(--gold-mid) uppercase tracking-[0.2em] text-xs">
            {t('admin.raffleOverlay.title')}
          </p>
          <h2 className="text-(--gold-whisper) text-2xl font-bold mt-1">
            {prize ? `${prize.position} - ${prize.title}` : t('admin.raffleOverlay.result')}
          </h2>
        </div>

        <div className="relative h-[59vh] min-h-97.5 w-full">
          <Canvas
            shadows={{ type: PCFShadowMap }}
            camera={{ position: [0, 3.2, 7], fov: 44 }}
            gl={{ antialias: true, alpha: true }}
          >
            <RaffleGiftBoxScene animationRunId={animationRunId} />
          </Canvas>

          <div
            className="pointer-events-none absolute left-1/2 top-[56%]"
            style={{
              opacity: isWinnerCardVisible ? 1 : 0,
              transform: isWinnerCardVisible
                ? 'translate(-50%, -180px) scale(1)'
                : 'translate(-50%, 190px) scale(0.68)',
              transition: 'opacity 420ms ease-out, transform 1350ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="min-w-55 rounded-2xl border border-(--gold-whisper) bg-[linear-gradient(165deg,rgba(42,31,15,0.96)_0%,rgba(28,22,12,0.96)_100%)] px-5 py-4 text-center shadow-[0_22px_55px_rgba(0,0,0,0.65)]">
              <div
                style={{
                  opacity: isWinnerCardContentVisible ? 1 : 0,
                  transition: 'opacity 280ms ease-out',
                }}
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-(--gold-mid)">
                  {t('admin.raffleOverlay.winnerNumber')}
                </p>
                <p className="text-6xl leading-none font-bold text-(--gold-whisper) mt-2 drop-shadow-[0_0_14px_rgba(255,243,196,0.4)]">
                  {winnerData?.number ?? '--'}
                </p>
                <p className="mt-2 text-sm text-(--gold-light)">
                  {prize
                    ? `${prize.position} ${t('admin.raffleOverlay.prize')}`
                    : t('admin.raffleOverlay.ticketDrawn')}
                </p>
                {winnerData && <p className="mt-1 text-xs text-(--gold-mid)">{winnerData.name}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            disabled={!isDrawReadyToConfirm}
            type="button"
            onClick={handleBackToPrizeSelection}
            className="rounded-lg border border-(--gold-dark) bg-(--bg-base)/70 px-3 py-1.5 text-xs text-(--gold-light) transition hover:border-(--gold-mid)"
          >
            {t('admin.raffleOverlay.backToPrizeSelection')}
          </button>
          <button
            type="button"
            onClick={() => startDrawAnimation()}
            className="rounded-lg border border-(--gold-mid) bg-(--gold-mid) px-3 py-1.5 text-xs font-semibold text-(--bg-base) transition hover:bg-(--gold-light)"
          >
            {t('admin.raffleOverlay.reroll')}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-(--gold-dark) bg-(--bg-base)/70 px-4 py-1.5 text-xs text-(--gold-light) transition hover:border-(--gold-mid)"
          >
            {t('admin.raffleOverlay.close')}
          </button>
        </div>
      </div>

      <ConfirmationModal
        open={keepWinnerModalOpen}
        title={t('admin.raffleOverlay.keepWinnerModal.title')}
        message={t('admin.raffleOverlay.keepWinnerModal.message', {
          number: winnerData?.number ?? '--',
        })}
        confirmText={t('admin.raffleOverlay.keepWinnerModal.confirm')}
        cancelText={t('admin.raffleOverlay.keepWinnerModal.cancel')}
        isLoading={false}
        variant="primary"
        onClose={handleKeepWinnerNo}
        onConfirm={() => {
          void handleKeepWinnerYes()
        }}
      />
    </div>
  )
}

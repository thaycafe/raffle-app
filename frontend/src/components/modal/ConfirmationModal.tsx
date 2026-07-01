type ConfirmationModalProps = {
  open: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  isLoading: boolean
  variant?: 'danger' | 'primary'
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmationModal({
  open,
  title,
  message,
  confirmText,
  cancelText,
  isLoading,
  variant = 'danger',
  onClose,
  onConfirm,
}: ConfirmationModalProps) {
  const handleClose = () => {
    if (isLoading) return
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      onClick={handleClose}
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-200 ${
        open ? 'bg-black/60 opacity-100' : 'pointer-events-none bg-transparent opacity-0'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl border border-(--gold-mid) bg-(--bg-elevated) p-6 shadow-[0_24px_64px_rgba(0,0,0,0.75)] transition-all duration-200 ${
          open ? 'scale-100 translate-y-0' : 'scale-95 translate-y-3'
        }`}
      >
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-(--gold-whisper)">{title}</h2>
          <p className="text-sm leading-6 text-(--gold-light)">{message}</p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="rounded-lg border border-(--gold-dark) bg-(--bg-base-solid) px-4 py-2 text-sm font-medium text-(--gold-mid) transition hover:border-(--gold-mid) hover:text-(--gold-light) disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              variant === 'danger'
                ? 'border border-(--error) bg-(--error) text-white hover:opacity-90'
                : 'border border-(--gold-mid) bg-(--gold-mid) text-(--bg-base) hover:border-(--gold-light) hover:bg-(--gold-light)'
            }`}
          >
            {isLoading ? `${confirmText}...` : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

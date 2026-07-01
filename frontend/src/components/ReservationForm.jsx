import { useTranslation } from 'react-i18next'

export default function ReservationForm({
  selected,
  config,
  name,
  setName,
  phone,
  handlePhoneChange,
  submitting,
  error,
  onSubmit,
}) {
  const { t } = useTranslation()
  const total = (selected.length * config.price).toFixed(2)

  const inputClass =
    'px-4 py-3 rounded-lg bg-[#0c0f14] border border-[#D96225]/50 text-[#da8326] placeholder-[#D96225]/50 focus:outline-none focus:ring-2 focus:ring-[#da8326] focus:border-[#da8326]'

  return (
    <section className="bg-[#0c0f14] rounded-2xl shadow-sm p-6 border border-[#D96225]/30">
      <h2 className="text-xl font-bold mb-1 text-[#da8326]">
        {t('yourDetails')}
      </h2>

      {selected.length > 0 ? (
        <p className="text-sm text-[#D96225] mb-4">
          {t('form.selectedCount', { count: selected.length })}
          {' · '}
          <span className="font-bold text-[#da8326]">
            {total} {config.currency}
          </span>
        </p>
      ) : (
        <p className="text-sm text-[#D96225]/60 mb-4">{t('form.noneSelected')}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder={t('form.name')}
          value={name}
          onChange={e => setName(e.target.value)}
          className={inputClass}
        />
        <input
          type="tel"
          inputMode="tel"
          placeholder={t('form.phone')}
          value={phone}
          onChange={handlePhoneChange}
          className={inputClass}
        />
      </div>

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={submitting || selected.length === 0}
        className="mt-4 px-6 py-3 bg-[#da8326] text-[#0c0f14] rounded-lg font-bold hover:bg-[#D96225] disabled:bg-[#0c0f14] disabled:text-[#D96225]/40 disabled:border disabled:border-[#D96225]/20 disabled:cursor-not-allowed transition cursor-pointer"
      >
        {submitting
          ? t('form.submitting')
          : t('form.submit', { count: selected.length })}
      </button>
    </section>
  )
}

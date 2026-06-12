import { useTranslation } from 'react-i18next'

function LanguageToggle() {
  const { t, i18n } = useTranslation()

  return (
    <div
      className="relative inline-flex bg-(--bg-base) rounded-full p-1"
      role="group"
      aria-label={t('language.label')}
    >
      <button
        onClick={() => i18n.changeLanguage('en')}
        aria-pressed={i18n.resolvedLanguage === 'en'}
        className={`relative z-10 px-4 py-1 rounded-full text-sm font-medium transition ${
          i18n.resolvedLanguage === 'en' ? 'text-slate-900' : 'text-(--gold-mid)'
        }`}
      >
        {t('language.en')}
      </button>
      <button
        onClick={() => i18n.changeLanguage('pt')}
        aria-pressed={i18n.resolvedLanguage === 'pt'}
        className={`relative z-10 px-4 py-1 rounded-full text-sm font-medium transition ${
          i18n.resolvedLanguage === 'pt' ? 'text-slate-900' : 'text-(--gold-mid)'
        }`}
      >
        {t('language.pt')}
      </button>
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-(--gold-light) rounded-full shadow-sm transition-all duration-200 ${
          i18n.resolvedLanguage === 'en' ? 'left-1' : 'left-1/2'
        }`}
      />
    </div>
  )
}

export default LanguageToggle

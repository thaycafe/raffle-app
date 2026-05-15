import { useTranslation } from 'react-i18next'

function LanguageToggle() {
  const { t, i18n } = useTranslation()

  return (
    <div
      className="relative inline-flex bg-slate-200 rounded-full p-1"
      role="group"
      aria-label={t('language.label')}
    >
      <button
        onClick={() => i18n.changeLanguage('en')}
        aria-pressed={i18n.resolvedLanguage === 'en'}
        className={`relative z-10 px-4 py-1 rounded-full text-sm font-medium transition ${
          i18n.resolvedLanguage === 'en' ? 'text-slate-900' : 'text-slate-500'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => i18n.changeLanguage('pt')}
        aria-pressed={i18n.resolvedLanguage === 'pt'}
        className={`relative z-10 px-4 py-1 rounded-full text-sm font-medium transition ${
          i18n.resolvedLanguage === 'pt' ? 'text-slate-900' : 'text-slate-500'
        }`}
      >
        PT
      </button>
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-sm transition-all duration-200 ${
          i18n.resolvedLanguage === 'en' ? 'left-1' : 'left-1/2'
        }`}
      />
    </div>
  )
}

export default LanguageToggle

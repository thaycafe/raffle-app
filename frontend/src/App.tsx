import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import FloatingParticles from './components/shared/FloatingParticles'
import { useTickets } from './hooks/useTickets'
import Home from './pages/Home'

function App() {
  const { t, i18n } = useTranslation()
  const { config } = useTickets()

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
      <Home config={config} />
    </div>
  )
}

export default App

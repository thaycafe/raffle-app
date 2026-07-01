import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchConfig, fetchTickets, reserveTickets } from '../lib/api'

export function useTickets() {
  const { t } = useTranslation()

  const [config, setConfig] = useState(null)
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const loadTickets = () => {
    fetchTickets().then(setTickets)
  }

  useEffect(() => {
    fetchConfig().then(setConfig)
    loadTickets()
  }, [])

  const toggleNumber = (number) => {
    setSelected(prev =>
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    )
  }

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/[^\d\s+()-]/g, '')
    setPhone(cleaned)
  }

  const handleSubmit = async () => {
    if (selected.length === 0 || !name.trim() || !phone.trim()) {
      setError(t('form.missingFields'))
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const res = await reserveTickets(selected, name, phone)

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.detail || t('form.failed'))
      }

      const data = await res.json()
      setSuccess({ numbers: data.reserved, name })
      setSelected([])
      setName('')
      setPhone('')
      loadTickets()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return {
    config,
    tickets,
    selected,
    toggleNumber,
    name,
    setName,
    phone,
    handlePhoneChange,
    submitting,
    error,
    success,
    handleSubmit,
  }
}


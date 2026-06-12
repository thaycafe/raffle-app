import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Configuration } from '../types/home'
import React from 'react'

type Props = {
  selected: number[]
  config: Configuration
  onReserve: (name: string, phone: string) => Promise<void>
}

export default function ReservationForm({ selected, config, onReserve }: Props) {
  const { t } = useTranslation()

  const schema = z.object({
    name: z.string().min(1, t('form.nameRequired')),

    phone: z
      .string()
      .transform((val) => val.replace(/[^\d\s+()-]/g, ''))
      .pipe(
        z
          .string()
          .min(9, t('form.phoneMinLength'))
          .regex(/^[\d\s+()-]+$/, t('form.phoneInvalid'))
          .min(1, t('form.phoneRequired'))
      ),
  })

  type FormFields = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormFields>({
    mode: 'onChange',
    resolver: zodResolver(schema),
  })

  const total = (selected.length * config.price).toFixed(2)

  const onSubmit = async ({ name, phone }: FormFields) => {
    try {
      await onReserve(name, phone)
      reset()
    } catch (e) {
      const message = e instanceof Error ? e.message : t('form.failed')
      setError('root', { message })
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-lg bg-(--bg-base) border border-(--gold-dark) text-(--gold-mid) placeholder-(--gold-dark) focus:outline-none focus:ring-2 focus:ring-(--gold-mid) focus:border-(--gold-mid) transition'

  const fieldErrorClass = 'text-red-400 text-xs mt-1'

  return (
    <section className="bg-(--bg-surface) rounded-2xl shadow-sm p-6 border border-(--gold-dark)/50">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <h2 className="text-xl font-bold mb-1 text-(--gold-mid)">{t('yourDetails')}</h2>

        {selected.length > 0 ? (
          <p className="text-sm text-(--gold-light) mb-4">
            {t('form.selectedCount', { count: selected.length })}
            {' · '}
            <span className="font-bold text-(--gold-mid)">
              {total} {config.currency}
            </span>
          </p>
        ) : (
          <p className="text-sm text-(--gold-dark) mb-4">{t('form.noneSelected')}</p>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              placeholder={t('form.name')}
              className={inputClass}
              {...register('name')}
            />
            {errors.name && <p className={fieldErrorClass}>{errors.name.message}</p>}
          </div>

          <div>
            <input
              type="tel"
              inputMode="tel"
              placeholder={t('form.phone')}
              className={inputClass}
              {...register('phone', {
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/[^\d\s+()-]/g, '')
                },
              })}
            />
            {errors.phone && <p className={fieldErrorClass}>{errors.phone.message}</p>}
          </div>
        </div>

        {errors.root && <p className="text-red-400 text-sm mt-3">{errors.root.message}</p>}

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            disabled={isSubmitting || selected.length === 0 || !isValid}
            className="px-6 py-3 bg-(--gold-mid) text-(--bg-base) rounded-lg font-bold hover:bg-(--gold-light) disabled:bg-(--bg-surface) disabled:text-(--gold-dark)/50 disabled:border disabled:border-(--gold-dark)/30 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {isSubmitting ? t('form.submitting') : t('form.submit', { count: selected.length })}
          </button>
        </div>
      </form>
    </section>
  )
}

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import type { FormSchema } from '../../types/form'
import { getVisibleFields } from '../../lib/conditionalEngine'
import { FieldRenderer } from './FieldRenderer'
import { useResponseStore } from '../../store/responseStore'
import { useT } from '../../lib/i18n'

interface FormEmbedProps {
  form: FormSchema
  onSubmit?: (data: Record<string, unknown>) => void
  preview?: boolean
}

export function FormEmbed({ form, onSubmit, preview = false }: FormEmbedProps) {
  const t = useT()
  const submit = useResponseStore((s) => s.submit)
  const [values, setValues] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const visibleFields = getVisibleFields(form.fields, values)

  function setValue(fieldId: string, value: unknown) {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) setErrors((prev) => ({ ...prev, [fieldId]: '' }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (preview) return

    const newErrors: Record<string, string> = {}
    for (const field of visibleFields) {
      if (!field.required) continue
      if (field.type === 'section_divider' || field.type === 'statement') continue

      const val = values[field.id]
      const isEmpty =
        val == null ||
        val === '' ||
        (Array.isArray(val) && val.length === 0)

      if (isEmpty) {
        newErrors[field.id] = t('form_embed.required_error')
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (onSubmit) {
      onSubmit(values)
    } else {
      submit(form.id, values)
    }

    if (form.redirectUrl) {
      window.location.href = form.redirectUrl
      return
    }

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${form.accentColor}18` }}
        >
          <CheckCircle size={24} style={{ color: form.accentColor }} />
        </div>
        <h2 className="text-xl font-medium text-navy tracking-tight">
          {form.successMessage || t('form_embed.success_default')}
        </h2>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-12 px-6">
      {(form.title || form.description) && (
        <div className="mb-10 flex flex-col gap-4">
          {/* Decorative section label */}
          <div className="flex items-center gap-3">
            <div className="h-px w-6 bg-rule" />
            <span className="label-meta text-navy/30">{t('form_embed.form_label')}</span>
          </div>

          <div>
            {form.title && (
              <h1 className="text-2xl font-medium text-navy tracking-tight leading-snug mb-2">
                {form.title}
              </h1>
            )}
            {form.description && (
              <p className="text-sm text-navy/55 font-light leading-relaxed">
                {form.description}
              </p>
            )}
          </div>

          {/* Tick rule below title */}
          <div className="tick-rule-sm w-full" />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-6">
          {visibleFields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={(v) => setValue(field.id, v)}
              accentColor={form.accentColor}
              error={errors[field.id]}
            />
          ))}
        </div>

        {!preview && visibleFields.some(
          (f) => f.type !== 'section_divider' && f.type !== 'statement',
        ) && (
          <button
            type="submit"
            className="mt-8 px-6 py-2.5 rounded-input text-sm font-normal text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: form.accentColor }}
          >
            {form.submitLabel || t('form_embed.submit')}
          </button>
        )}

        {preview && (
          <div className="mt-8">
            <button
              type="button"
              className="px-6 py-2.5 rounded-input text-sm font-normal text-white opacity-70 cursor-default"
              style={{ backgroundColor: form.accentColor }}
            >
              {form.submitLabel || t('form_embed.submit')}
            </button>
            <p className="mt-2 text-[11px] text-mid/60 font-mono uppercase tracking-widest">
              {t('form_embed.preview_mode')}
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

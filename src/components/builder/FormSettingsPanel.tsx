import { X } from 'lucide-react'
import type { FormSchema } from '../../types/form'
import { Input, Textarea } from '../ui/Input'
import { useT } from '../../lib/i18n'

interface FormSettingsPanelProps {
  form: FormSchema
  onChange: (updates: Partial<Omit<FormSchema, 'id' | 'createdAt'>>) => void
  onClose: () => void
}

export function FormSettingsPanel({ form, onChange, onClose }: FormSettingsPanelProps) {
  const t = useT()
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(73,136,196,0.15)]">
        <p className="label-meta">{t('form_settings.title')}</p>
        <button type="button" onClick={onClose} className="text-mid hover:text-navy">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        <Input
          label={t('form_settings.form_title')}
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />

        <Textarea
          label={t('form_settings.description')}
          value={form.description ?? ''}
          rows={3}
          placeholder={t('form_settings.desc_placeholder')}
          onChange={(e) => onChange({ description: e.target.value })}
        />

        <Input
          label={t('form_settings.submit_label')}
          value={form.submitLabel}
          onChange={(e) => onChange({ submitLabel: e.target.value })}
        />

        <Textarea
          label={t('form_settings.success_message')}
          value={form.successMessage ?? ''}
          rows={2}
          placeholder={t('form_settings.success_placeholder')}
          onChange={(e) => onChange({ successMessage: e.target.value })}
        />

        <Input
          label={t('form_settings.redirect_url')}
          value={form.redirectUrl ?? ''}
          placeholder={t('form_settings.redirect_placeholder')}
          hint={t('form_settings.redirect_hint')}
          onChange={(e) => onChange({ redirectUrl: e.target.value })}
        />

        <div className="flex flex-col gap-1">
          <p className="label-meta">{t('form_settings.accent_color')}</p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="w-8 h-8 rounded-tag border border-[rgba(73,136,196,0.25)] cursor-pointer p-0.5 bg-white"
            />
            <span className="font-mono text-sm text-navy/70">{form.accentColor}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

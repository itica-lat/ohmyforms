import { useParams } from 'react-router-dom'
import { useFormStore } from '../store/formStore'
import { FormEmbed } from '../components/renderer/FormEmbed'
import { useT } from '../lib/i18n'

export function EmbedPage() {
  const t = useT()
  const { formId } = useParams<{ formId: string }>()
  const form = useFormStore((s) => s.getForm(formId ?? ''))

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-navy/40 font-light text-sm">{t('embed.not_found')}</p>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <FormEmbed form={form} />
    </div>
  )
}

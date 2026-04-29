import { useParams } from 'react-router-dom'
import { useFormStore } from '../store/formStore'
import { FormEmbed } from '../components/renderer/FormEmbed'

export function EmbedPage() {
  const { formId } = useParams<{ formId: string }>()
  const form = useFormStore((s) => s.getForm(formId ?? ''))

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-navy/40 font-light text-sm">Form not found</p>
      </div>
    )
  }

  return (
    <div className="bg-white">
      <FormEmbed form={form} />
    </div>
  )
}

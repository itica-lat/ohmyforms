import { useParams, Link } from 'react-router-dom'
import { useFormStore } from '../store/formStore'
import { FormEmbed } from '../components/renderer/FormEmbed'

export function PublicFormPage() {
  const { formId } = useParams<{ formId: string }>()
  const form = useFormStore((s) => s.getForm(formId ?? ''))

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-2 text-center">
        <p className="text-navy/40 font-light">Form not found</p>
        <Link to="/" className="text-blue text-sm hover:underline">
          Go home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      {/* Header */}
      <header className="px-8 py-3 border-b border-rule flex items-center justify-between">
        <span className="label-meta text-mid/50">OhMyForms</span>
        <span className="font-light text-xs text-navy/40 truncate max-w-xs">{form.title}</span>
      </header>

      {/* Tick rule */}
      <div className="tick-rule w-full" />

      {/* Form content */}
      <div className="flex-1">
        <FormEmbed form={form} />
      </div>

      {/* Footer */}
      <div className="tick-rule-sm w-full" />
      <footer className="py-3 border-t border-rule flex items-center justify-center gap-3">
        <div className="h-px w-8 bg-rule" />
        <span className="label-meta text-navy/25">Powered by OhMyForms</span>
        <div className="h-px w-8 bg-rule" />
      </footer>
    </div>
  )
}

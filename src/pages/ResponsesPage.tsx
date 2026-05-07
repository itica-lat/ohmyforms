import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { useFormStore } from '../store/formStore'
import { useResponseStore } from '../store/responseStore'
import { ResponseTable } from '../components/responses/ResponseTable'
import { useT } from '../lib/i18n'

export function ResponsesPage() {
  const t = useT()
  const { formId } = useParams<{ formId: string }>()
  const form = useFormStore((s) => s.getForm(formId ?? ''))
  const allResponses = useResponseStore((s) => s.responses)
  const deleteResponse = useResponseStore((s) => s.deleteResponse)
  const responses = useMemo(
    () =>
      allResponses
        .filter((r) => r.formId === formId)
        .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)),
    [allResponses, formId],
  )
  const clearResponses = useResponseStore((s) => s.clearResponses)

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-2">
        <p className="text-navy/40 font-light">{t('responses.not_found')}</p>
        <Link to="/" className="text-blue text-sm hover:underline">
          {t('responses.go_home')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-svh overflow-hidden bg-white">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-[rgba(73,136,196,0.15)] shrink-0">
        <Link to="/" className="text-mid hover:text-navy transition-colors">
          <ChevronLeft size={16} />
        </Link>
        <span className="font-normal text-navy text-sm">{form.title}</span>
        <span className="label-meta text-mid/50 ml-1">{t('responses.breadcrumb')}</span>
        <Link
          to={`/builder/${form.id}`}
          className="ml-auto text-sm text-mid hover:text-navy transition-colors font-light"
        >
          {t('responses.edit_form')}
        </Link>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResponseTable
          form={form}
          responses={responses}
          onDelete={deleteResponse}
          onClear={() => clearResponses(form.id)}
        />
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Download, Trash2, Search } from 'lucide-react'
import type { FormSchema, FormResponse } from '../../types/form'
import { FIELD_TYPE_META } from '../../types/form'
import { formatDate, download, toCSV } from '../../lib/utils'
import { Button } from '../ui/Button'

interface ResponseTableProps {
  form: FormSchema
  responses: FormResponse[]
  onDelete: (id: string) => void
  onClear: () => void
}

export function ResponseTable({ form, responses, onDelete, onClear }: ResponseTableProps) {
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const dataFields = form.fields.filter(
    (f) => FIELD_TYPE_META[f.type].hasValue,
  )

  const filtered = responses
    .filter((r) => {
      if (!search.trim()) return true
      const searchLower = search.toLowerCase()
      return Object.values(r.data).some((v) =>
        String(v ?? '').toLowerCase().includes(searchLower),
      )
    })
    .sort((a, b) => {
      const cmp = a.submittedAt.localeCompare(b.submittedAt)
      return sortAsc ? cmp : -cmp
    })

  function exportCSV() {
    const headers = ['Submitted at', ...dataFields.map((f) => f.label)]
    const rows = responses.map((r) => ({
      'Submitted at': r.submittedAt,
      ...Object.fromEntries(
        dataFields.map((f) => {
          const val = r.data[f.id]
          return [f.label, Array.isArray(val) ? val.join(', ') : String(val ?? '')]
        }),
      ),
    }))
    download(toCSV(rows, headers), `${form.title}-responses.csv`, 'text/csv')
  }

  const selected = selectedId ? responses.find((r) => r.id === selectedId) : null

  if (responses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
        <p className="text-navy/40 font-light text-sm">No responses yet</p>
        <p className="text-mid/40 text-xs font-mono uppercase tracking-widest">
          Share the form link to start collecting
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-0 h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[rgba(73,136,196,0.15)]">
          <div className="flex items-center gap-2 flex-1 max-w-xs border border-rule rounded-input px-3 py-1.5 bg-white">
            <Search size={13} className="text-mid shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search responses"
              className="flex-1 text-sm text-navy placeholder:text-mid/50 bg-transparent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="label-meta text-navy/40">
              {filtered.length} of {responses.length}
            </span>
            <Button size="sm" variant="secondary" onClick={exportCSV}>
              <Download size={13} />
              Export CSV
            </Button>
            {responses.length > 0 && (
              <Button size="sm" variant="danger" onClick={onClear}>
                <Trash2 size={13} />
                Clear all
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[rgba(73,136,196,0.15)]">
                <th
                  className="px-6 py-3 text-left label-meta text-navy/50 cursor-pointer hover:text-navy whitespace-nowrap"
                  onClick={() => setSortAsc(!sortAsc)}
                >
                  Submitted {sortAsc ? '↑' : '↓'}
                </th>
                {dataFields.slice(0, 5).map((f) => (
                  <th key={f.id} className="px-4 py-3 text-left label-meta text-navy/50 whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => setSelectedId(selectedId === r.id ? null : r.id)}
                  className={[
                    'border-b border-[rgba(73,136,196,0.08)] cursor-pointer transition-colors',
                    selectedId === r.id ? 'bg-sky/20' : 'hover:bg-sky/10',
                  ].join(' ')}
                >
                  <td className="px-6 py-3 text-navy/60 font-light whitespace-nowrap text-[12px]">
                    {formatDate(r.submittedAt)}
                  </td>
                  {dataFields.slice(0, 5).map((f) => {
                    const val = r.data[f.id]
                    const display = Array.isArray(val) ? val.join(', ') : String(val ?? '')
                    return (
                      <td key={f.id} className="px-4 py-3 text-navy font-light max-w-[180px]">
                        <span className="block truncate">{display || '—'}</span>
                      </td>
                    )
                  })}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(r.id)
                      }}
                      className="text-mid/50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ResponseDetail
          response={selected}
          dataFields={dataFields}
          onClose={() => setSelectedId(null)}
          onDelete={() => {
            onDelete(selected.id)
            setSelectedId(null)
          }}
        />
      )}
    </div>
  )
}

function ResponseDetail({
  response,
  dataFields,
  onClose,
  onDelete,
}: {
  response: FormResponse
  dataFields: FormSchema['fields']
  onClose: () => void
  onDelete: () => void
}) {
  return (
    <div className="w-80 border-l border-[rgba(73,136,196,0.15)] flex flex-col shrink-0">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(73,136,196,0.15)]">
        <p className="label-meta">Response detail</p>
        <button type="button" onClick={onClose} className="text-mid hover:text-navy text-sm">
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        <div>
          <p className="label-meta mb-1">Submitted</p>
          <p className="text-sm text-navy font-light">{formatDate(response.submittedAt)}</p>
        </div>
        {dataFields.map((f) => {
          const val = response.data[f.id]
          const display = Array.isArray(val) ? val.join(', ') : String(val ?? '')
          if (f.type === 'signature' && display.startsWith('data:')) {
            return (
              <div key={f.id}>
                <p className="label-meta mb-1">{f.label}</p>
                <img src={display} alt="Signature" className="w-full rounded border border-rule" />
              </div>
            )
          }
          return (
            <div key={f.id}>
              <p className="label-meta mb-1">{f.label}</p>
              <p className="text-sm text-navy font-light break-words">{display || '—'}</p>
            </div>
          )
        })}
      </div>
      <div className="p-5 border-t border-[rgba(73,136,196,0.15)]">
        <Button size="sm" variant="danger" onClick={onDelete} className="w-full justify-center">
          <Trash2 size={13} />
          Delete response
        </Button>
      </div>
    </div>
  )
}

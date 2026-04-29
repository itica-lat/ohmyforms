import { useState, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Settings, Eye, BarChart2, ChevronLeft, Share2 } from 'lucide-react'
import { useFormStore } from '../store/formStore'
import { useResponseStore } from '../store/responseStore'
import type { FieldDefinition, FieldType } from '../types/form'
import { FieldTypePicker } from '../components/builder/FieldTypePicker'
import { FieldCard } from '../components/builder/FieldCard'
import { FieldSettingsPanel } from '../components/builder/FieldSettingsPanel'
import { FormSettingsPanel } from '../components/builder/FormSettingsPanel'
import { FormEmbed } from '../components/renderer/FormEmbed'
import { ResponseTable } from '../components/responses/ResponseTable'
import { Button } from '../components/ui/Button'

type Tab = 'build' | 'preview' | 'responses' | 'share'
type RightPanel = 'field' | 'form' | null

export function BuilderPage() {
  const { formId } = useParams<{ formId: string }>()

  const form = useFormStore((s) => s.getForm(formId ?? ''))
  const updateForm = useFormStore((s) => s.updateForm)
  const addField = useFormStore((s) => s.addField)
  const updateField = useFormStore((s) => s.updateField)
  const removeField = useFormStore((s) => s.removeField)
  const reorderFields = useFormStore((s) => s.reorderFields)
  const duplicateField = useFormStore((s) => s.duplicateField)

  const allResponses = useResponseStore((s) => s.responses)
  const deleteResponse = useResponseStore((s) => s.deleteResponse)
  const clearResponses = useResponseStore((s) => s.clearResponses)
  const responses = useMemo(
    () =>
      allResponses
        .filter((r) => r.formId === formId)
        .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)),
    [allResponses, formId],
  )

  const [tab, setTab] = useState<Tab>('build')
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [rightPanel, setRightPanel] = useState<RightPanel>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!form || !formId) return
      const { active, over } = event
      if (!over || active.id === over.id) return
      const from = form.fields.findIndex((f) => f.id === active.id)
      const to = form.fields.findIndex((f) => f.id === over.id)
      if (from !== -1 && to !== -1) reorderFields(formId, from, to)
    },
    [form, formId, reorderFields],
  )

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center h-svh text-navy/40">
        <p>Form not found.</p>
        <Link to="/" className="text-blue text-sm mt-2 hover:underline">
          Back to home
        </Link>
      </div>
    )
  }

  const selectedField = selectedFieldId
    ? form.fields.find((f) => f.id === selectedFieldId) ?? null
    : null

  function handleAddField(type: FieldType) {
    if (!formId) return
    addField(formId, type)
    // After adding, select the new field (last in the list) and open settings
    const updated = useFormStore.getState().getForm(formId)
    const newField = updated?.fields[updated.fields.length - 1]
    if (newField) {
      setSelectedFieldId(newField.id)
      setRightPanel('field')
    }
  }

  function handleSelectField(id: string) {
    setSelectedFieldId(id)
    setRightPanel('field')
  }

  function handleUpdateField(updates: Partial<FieldDefinition>) {
    if (!formId || !selectedFieldId) return
    updateField(formId, selectedFieldId, updates)
  }

  function handleClosePanel() {
    setSelectedFieldId(null)
    setRightPanel(null)
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'build', label: 'Build', icon: null },
    { id: 'preview', label: 'Preview', icon: <Eye size={13} /> },
    { id: 'responses', label: `Responses (${responses.length})`, icon: <BarChart2 size={13} /> },
    { id: 'share', label: 'Share', icon: <Share2 size={13} /> },
  ]

  return (
    <div className="flex flex-col h-svh overflow-hidden bg-white">
      {/* Top nav */}
      <header className="flex items-center gap-4 px-5 py-3 border-b border-rule shrink-0">
        <Link to="/" className="text-mid hover:text-navy transition-colors shrink-0">
          <ChevronLeft size={16} />
        </Link>

        <input
          type="text"
          value={form.title}
          onChange={(e) => updateForm(form.id, { title: e.target.value })}
          className="font-normal text-navy text-sm bg-transparent border-none focus:outline-none min-w-0 flex-1 max-w-65"
          placeholder="Untitled form"
        />

        <nav className="flex items-center gap-0.5 ml-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-input text-sm transition-colors',
                tab === t.id
                  ? 'bg-sky/50 text-navy font-normal'
                  : 'text-mid hover:text-navy hover:bg-sky/30 font-light',
              ].join(' ')}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setRightPanel(rightPanel === 'form' ? null : 'form')
            }
          >
            <Settings size={13} />
            Form settings
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => window.open(`/form/${form.id}`, '_blank')}
          >
            Open form
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — field picker (only on build tab) */}
        {tab === 'build' && (
          <aside className="w-52 border-r border-rule overflow-y-auto shrink-0 bg-white flex flex-col">
            <div className="px-4 pt-4 pb-3 border-b border-rule flex flex-col gap-2">
              <p className="label-meta text-navy/40">Add field</p>
              <div className="tick-rule-sm w-full" />
            </div>
            <FieldTypePicker onAdd={handleAddField} />
          </aside>
        )}

        {/* Builder canvas or other views */}
        <div className="flex-1 overflow-hidden flex">
          {tab === 'build' && (
            <div className="flex-1 overflow-y-auto p-6">
              {form.fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-6 py-24 text-center max-w-xs mx-auto">
                  <div className="tick-rule w-full" />
                  <div className="flex flex-col gap-2">
                    <p className="font-serif italic text-xl text-navy/30">
                      Start with a field.
                    </p>
                    <p className="text-xs text-mid/50 font-light">
                      Pick a type from the sidebar to add your first field.
                    </p>
                  </div>
                  <div className="tick-rule w-full" />
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={form.fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2 max-w-xl mx-auto">
                      {form.fields.map((field) => (
                        <FieldCard
                          key={field.id}
                          field={field}
                          isSelected={selectedFieldId === field.id}
                          onSelect={() => handleSelectField(field.id)}
                          onDuplicate={() => {
                            if (formId) duplicateField(formId, field.id)
                          }}
                          onDelete={() => {
                            if (formId) removeField(formId, field.id)
                            if (selectedFieldId === field.id) handleClosePanel()
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}

          {tab === 'preview' && (
            <div className="flex-1 overflow-y-auto border-l border-[rgba(73,136,196,0.1)] bg-[#fafcff]">
              <FormEmbed form={form} preview />
            </div>
          )}

          {tab === 'responses' && (
            <div className="flex-1 overflow-hidden">
              <ResponseTable
                form={form}
                responses={responses}
                onDelete={deleteResponse}
                onClear={() => clearResponses(form.id)}
              />
            </div>
          )}

          {tab === 'share' && (
            <div className="flex-1 overflow-y-auto p-10">
              <SharePanel formId={form.id} />
            </div>
          )}
        </div>

        {/* Right panel — field or form settings */}
        {rightPanel === 'field' && selectedField && (
          <aside className="w-72 border-l border-[rgba(73,136,196,0.12)] overflow-hidden flex flex-col shrink-0 bg-white">
            <FieldSettingsPanel
              field={selectedField}
              allFields={form.fields}
              onChange={handleUpdateField}
              onClose={handleClosePanel}
            />
          </aside>
        )}

        {rightPanel === 'form' && (
          <aside className="w-72 border-l border-[rgba(73,136,196,0.12)] overflow-hidden flex flex-col shrink-0 bg-white">
            <FormSettingsPanel
              form={form}
              onChange={(updates) => updateForm(form.id, updates)}
              onClose={() => setRightPanel(null)}
            />
          </aside>
        )}
      </div>
    </div>
  )
}

function SharePanel({ formId }: { formId: string }) {
  const publicUrl = `${window.location.origin}/form/${formId}`
  const embedCode = `<iframe src="${window.location.origin}/embed/${formId}" width="100%" height="600" frameborder="0"></iframe>`
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-medium text-navy tracking-tight mb-1">Share</h2>
        <p className="text-sm text-navy/50 font-light">
          Distribute this form via a public link or embed it on any website.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="label-meta">Public link</p>
        <div className="flex items-center gap-2 p-3 rounded-input border border-rule bg-sky/10">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-sm text-blue font-mono truncate hover:underline"
          >
            {publicUrl}
          </a>
          <button
            type="button"
            onClick={() => copy(publicUrl, 'link')}
            className="shrink-0 text-xs label-meta text-mid hover:text-navy transition-colors"
          >
            {copied === 'link' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="label-meta">Embed code</p>
        <div className="flex flex-col gap-2 p-3 rounded-input border border-rule bg-sky/10">
          <pre className="text-[11px] font-mono text-navy/70 whitespace-pre-wrap break-all leading-relaxed">
            {embedCode}
          </pre>
          <button
            type="button"
            onClick={() => copy(embedCode, 'embed')}
            className="self-start text-xs label-meta text-mid hover:text-navy transition-colors"
          >
            {copied === 'embed' ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

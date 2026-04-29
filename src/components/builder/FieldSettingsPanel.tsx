import { X, Plus } from 'lucide-react'
import type { Condition, ConditionOperator, FieldDefinition } from '../../types/form'
import { Input, Textarea } from '../ui/Input'
import { Toggle } from '../ui/Toggle'
import { Button } from '../ui/Button'

interface FieldSettingsPanelProps {
  field: FieldDefinition
  allFields: FieldDefinition[]
  onChange: (updates: Partial<FieldDefinition>) => void
  onClose: () => void
}

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
]

function ConditionRow({
  condition,
  fields,
  onChange,
  onRemove,
}: {
  condition: Condition
  fields: FieldDefinition[]
  onChange: (c: Condition) => void
  onRemove: () => void
}) {
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.if.operator)

  return (
    <div className="flex flex-col gap-2 p-3 rounded-input border border-[rgba(73,136,196,0.15)] bg-sky/20">
      <div className="flex items-center gap-2">
        <span className="text-[11px] label-meta">If</span>
        <select
          value={condition.if.fieldId}
          onChange={(e) =>
            onChange({ ...condition, if: { ...condition.if, fieldId: e.target.value } })
          }
          className="flex-1 text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
        >
          <option value="">Select field</option>
          {fields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          className="text-mid hover:text-navy shrink-0"
        >
          <X size={13} />
        </button>
      </div>
      <select
        value={condition.if.operator}
        onChange={(e) =>
          onChange({
            ...condition,
            if: { ...condition.if, operator: e.target.value as ConditionOperator },
          })
        }
        className="text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {needsValue && (
        <input
          type="text"
          value={String(condition.if.value ?? '')}
          onChange={(e) =>
            onChange({ ...condition, if: { ...condition.if, value: e.target.value } })
          }
          placeholder="Value"
          className="text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
        />
      )}
      <div className="flex items-center gap-2">
        <span className="text-[11px] label-meta">Then</span>
        <select
          value={condition.action}
          onChange={(e) =>
            onChange({ ...condition, action: e.target.value as 'show' | 'hide' })
          }
          className="text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
        >
          <option value="show">Show this field</option>
          <option value="hide">Hide this field</option>
        </select>
      </div>
    </div>
  )
}

export function FieldSettingsPanel({
  field,
  allFields,
  onChange,
  onClose,
}: FieldSettingsPanelProps) {
  const isLayout = field.type === 'section_divider' || field.type === 'statement'
  const isSelect = field.type === 'single_select' || field.type === 'multi_select'
  const otherFields = allFields.filter((f) => f.id !== field.id)

  function addOption() {
    const options = [...(field.options ?? []), `Option ${(field.options?.length ?? 0) + 1}`]
    onChange({ options })
  }

  function updateOption(i: number, value: string) {
    const options = [...(field.options ?? [])]
    options[i] = value
    onChange({ options })
  }

  function removeOption(i: number) {
    const options = (field.options ?? []).filter((_, idx) => idx !== i)
    onChange({ options })
  }

  function addCondition() {
    const conditions: Condition[] = [
      ...(field.conditions ?? []),
      {
        if: { fieldId: otherFields[0]?.id ?? '', operator: 'equals', value: '' },
        action: 'show',
      },
    ]
    onChange({ conditions })
  }

  function updateCondition(i: number, c: Condition) {
    const conditions = [...(field.conditions ?? [])]
    conditions[i] = c
    onChange({ conditions })
  }

  function removeCondition(i: number) {
    const conditions = (field.conditions ?? []).filter((_, idx) => idx !== i)
    onChange({ conditions })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(73,136,196,0.15)]">
        <p className="label-meta">Field settings</p>
        <button type="button" onClick={onClose} className="text-mid hover:text-navy">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        <Input
          label="Label"
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />

        {field.type === 'statement' && (
          <Textarea
            label="Content"
            value={field.content ?? ''}
            rows={4}
            onChange={(e) => onChange({ content: e.target.value })}
          />
        )}

        {field.type === 'section_divider' && (
          <Input
            label="Title (optional)"
            value={field.content ?? ''}
            placeholder="Section title"
            onChange={(e) => onChange({ content: e.target.value })}
          />
        )}

        {!isLayout && (
          <>
            <Input
              label="Placeholder"
              value={field.placeholder ?? ''}
              onChange={(e) => onChange({ placeholder: e.target.value })}
            />

            <Input
              label="Help text"
              value={field.helpText ?? ''}
              onChange={(e) => onChange({ helpText: e.target.value })}
            />

            <Toggle
              checked={field.required ?? false}
              onChange={(v) => onChange({ required: v })}
              label="Required"
            />
          </>
        )}

        {field.type === 'file_upload' && (
          <Input
            label="Accepted file types"
            value={field.acceptTypes ?? ''}
            placeholder=".pdf,.docx,image/*"
            hint="Comma-separated MIME types or extensions"
            onChange={(e) => onChange({ acceptTypes: e.target.value })}
          />
        )}

        {isSelect && (
          <div className="flex flex-col gap-2">
            <p className="label-meta">Options</p>
            {(field.options ?? []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 rounded-input border border-[rgba(73,136,196,0.25)] px-2 py-1.5 text-sm text-navy bg-white"
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="text-mid hover:text-navy shrink-0"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
            <Button size="sm" variant="ghost" onClick={addOption} className="self-start">
              <Plus size={13} />
              Add option
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 border-t border-[rgba(73,136,196,0.15)]">
          <p className="label-meta">Conditional logic</p>
          {(field.conditions ?? []).map((c, i) => (
            <ConditionRow
              key={i}
              condition={c}
              fields={otherFields}
              onChange={(updated) => updateCondition(i, updated)}
              onRemove={() => removeCondition(i)}
            />
          ))}
          {otherFields.length > 0 ? (
            <Button size="sm" variant="ghost" onClick={addCondition} className="self-start">
              <Plus size={13} />
              Add condition
            </Button>
          ) : (
            <p className="text-[11px] text-mid/70">Add more fields to create conditions.</p>
          )}
        </div>
      </div>
    </div>
  )
}

import { X, Plus } from 'lucide-react'
import type { Condition, ConditionOperator, FieldDefinition } from '../../types/form'
import { Input, Textarea } from '../ui/Input'
import { Toggle } from '../ui/Toggle'
import { Button } from '../ui/Button'
import { useT } from '../../lib/i18n'

interface FieldSettingsPanelProps {
  field: FieldDefinition
  allFields: FieldDefinition[]
  onChange: (updates: Partial<FieldDefinition>) => void
  onClose: () => void
}

const OPERATOR_KEYS: { value: ConditionOperator; labelKey: string }[] = [
  { value: 'equals', labelKey: 'field_settings.op.equals' },
  { value: 'not_equals', labelKey: 'field_settings.op.not_equals' },
  { value: 'contains', labelKey: 'field_settings.op.contains' },
  { value: 'is_empty', labelKey: 'field_settings.op.is_empty' },
  { value: 'is_not_empty', labelKey: 'field_settings.op.is_not_empty' },
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
  const t = useT()
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.if.operator)

  return (
    <div className="flex flex-col gap-2 p-3 rounded-input border border-[rgba(73,136,196,0.15)] bg-sky/20">
      <div className="flex items-center gap-2">
        <span className="text-[11px] label-meta">{t('field_settings.if')}</span>
        <select
          value={condition.if.fieldId}
          onChange={(e) =>
            onChange({ ...condition, if: { ...condition.if, fieldId: e.target.value } })
          }
          className="flex-1 text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
        >
          <option value="">{t('field_settings.select_field')}</option>
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
        {OPERATOR_KEYS.map((op) => (
          <option key={op.value} value={op.value}>
            {t(op.labelKey as any)}
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
          placeholder={t('field_settings.value')}
          className="text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
        />
      )}
      <div className="flex items-center gap-2">
        <span className="text-[11px] label-meta">{t('field_settings.then')}</span>
        <select
          value={condition.action}
          onChange={(e) =>
            onChange({ ...condition, action: e.target.value as 'show' | 'hide' })
          }
          className="text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
        >
          <option value="show">{t('field_settings.show_field')}</option>
          <option value="hide">{t('field_settings.hide_field')}</option>
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
  const t = useT()
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
        <p className="label-meta">{t('field_settings.title')}</p>
        <button type="button" onClick={onClose} className="text-mid hover:text-navy">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        <Input
          label={t('field_settings.label')}
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />

        {field.type === 'statement' && (
          <Textarea
            label={t('field_settings.content')}
            value={field.content ?? ''}
            rows={4}
            onChange={(e) => onChange({ content: e.target.value })}
          />
        )}

        {field.type === 'section_divider' && (
          <Input
            label={t('field_settings.title_optional')}
            value={field.content ?? ''}
            placeholder={t('field_settings.section_title')}
            onChange={(e) => onChange({ content: e.target.value })}
          />
        )}

        {!isLayout && (
          <>
            <Input
              label={t('field_settings.placeholder')}
              value={field.placeholder ?? ''}
              onChange={(e) => onChange({ placeholder: e.target.value })}
            />

            <Input
              label={t('field_settings.help_text')}
              value={field.helpText ?? ''}
              onChange={(e) => onChange({ helpText: e.target.value })}
            />

            <Toggle
              checked={field.required ?? false}
              onChange={(v) => onChange({ required: v })}
              label={t('field_settings.required')}
            />
          </>
        )}

        {field.type === 'file_upload' && (
          <Input
            label={t('field_settings.accepted_types')}
            value={field.acceptTypes ?? ''}
            placeholder=".pdf,.docx,image/*"
            hint={t('field_settings.accepted_types_hint')}
            onChange={(e) => onChange({ acceptTypes: e.target.value })}
          />
        )}

        {isSelect && (
          <div className="flex flex-col gap-2">
            <p className="label-meta">{t('field_settings.options')}</p>
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
              {t('field_settings.add_option')}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2 border-t border-[rgba(73,136,196,0.15)]">
          <p className="label-meta">{t('field_settings.conditional_logic')}</p>
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
              {t('field_settings.add_condition')}
            </Button>
          ) : (
            <p className="text-[11px] text-mid/70">{t('field_settings.condition_hint')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

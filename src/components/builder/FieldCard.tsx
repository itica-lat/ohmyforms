import { GripVertical, Copy, Trash2, Settings } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FieldDefinition } from '../../types/form'
import { FIELD_TYPE_META } from '../../types/form'
import { useT } from '../../lib/i18n'

interface FieldCardProps {
  field: FieldDefinition
  isSelected: boolean
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
}

export function FieldCard({
  field,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: FieldCardProps) {
  const t = useT()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const meta = FIELD_TYPE_META[field.type]

  if (field.type === 'section_divider') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={[
          'group flex items-center gap-3 px-3 py-2 rounded-card border transition-colors',
          isSelected
            ? 'border-blue bg-blue/5'
            : 'border-[rgba(73,136,196,0.15)] hover:border-[rgba(73,136,196,0.3)]',
        ].join(' ')}
        onClick={onSelect}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-mid/40 hover:text-mid cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="h-px flex-1 bg-rule" />
          {field.content && (
            <span className="label-meta text-navy/50 shrink-0">{field.content}</span>
          )}
          {!field.content && (
            <span className="label-meta text-navy/30 shrink-0">{t('field_card.section_divider')}</span>
          )}
          <div className="h-px flex-1 bg-rule" />
        </div>
        <FieldActions
          onEdit={onSelect}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        'group flex items-start gap-3 px-3 py-3 rounded-card border transition-colors',
        isSelected
          ? 'border-blue bg-blue/5'
          : 'border-[rgba(73,136,196,0.15)] hover:border-[rgba(73,136,196,0.3)]',
      ].join(' ')}
      onClick={onSelect}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="text-mid/40 hover:text-mid cursor-grab active:cursor-grabbing mt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-normal text-navy truncate">{field.label}</span>
          {field.required && (
            <span className="text-red-400 text-xs leading-none">*</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="label-meta text-navy/40">{meta.label}</span>
          {field.conditions && field.conditions.length > 0 && (
            <span className="label-meta text-mid/60">· {t('field_card.conditional')}</span>
          )}
        </div>
      </div>

      <FieldActions
        onEdit={onSelect}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </div>
  )
}

function FieldActions({
  onEdit,
  onDuplicate,
  onDelete,
}: {
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onEdit}
        className="p-1.5 rounded-tag text-mid hover:text-navy hover:bg-sky/50 transition-colors"
      >
        <Settings size={13} />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="p-1.5 rounded-tag text-mid hover:text-navy hover:bg-sky/50 transition-colors"
      >
        <Copy size={13} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 rounded-tag text-mid hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

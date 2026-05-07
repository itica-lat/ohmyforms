import {
  AlignLeft,
  AlignJustify,
  AtSign,
  Hash,
  Calendar,
  Clock,
  ChevronDown,
  CheckSquare,
  Upload,
  PenLine,
  Minus,
  FileText,
  Plus,
} from 'lucide-react'
import type { FieldType } from '../../types/form'
import { useT } from '../../lib/i18n'

interface FieldTypePickerProps {
  onAdd: (type: FieldType) => void
}

const FIELD_ICONS: Record<FieldType, React.ReactNode> = {
  short_text: <AlignLeft size={14} />,
  long_text: <AlignJustify size={14} />,
  email: <AtSign size={14} />,
  number: <Hash size={14} />,
  date: <Calendar size={14} />,
  datetime: <Clock size={14} />,
  single_select: <ChevronDown size={14} />,
  multi_select: <CheckSquare size={14} />,
  file_upload: <Upload size={14} />,
  signature: <PenLine size={14} />,
  section_divider: <Minus size={14} />,
  statement: <FileText size={14} />,
}

const CATEGORIES: { labelKey: string; fields: FieldType[] }[] = [
  { labelKey: 'field_type.cat.text', fields: ['short_text', 'long_text', 'email', 'number'] },
  { labelKey: 'field_type.cat.date_time', fields: ['date', 'datetime'] },
  { labelKey: 'field_type.cat.choice', fields: ['single_select', 'multi_select'] },
  { labelKey: 'field_type.cat.media', fields: ['file_upload', 'signature'] },
  { labelKey: 'field_type.cat.layout', fields: ['section_divider', 'statement'] },
]

const FIELD_LABEL_KEYS: Record<FieldType, string> = {
  short_text: 'field_type.short_text',
  long_text: 'field_type.long_text',
  email: 'field_type.email',
  number: 'field_type.number',
  date: 'field_type.date',
  datetime: 'field_type.date_time',
  single_select: 'field_type.single_select',
  multi_select: 'field_type.multi_select',
  file_upload: 'field_type.file_upload',
  signature: 'field_type.signature',
  section_divider: 'field_type.section_divider',
  statement: 'field_type.statement',
}

export function FieldTypePicker({ onAdd }: FieldTypePickerProps) {
  const t = useT()
  return (
    <div className="flex flex-col gap-5 py-4">
      {CATEGORIES.map((cat) => (
        <div key={cat.labelKey}>
          <p className="label-meta px-4 mb-2">{t(cat.labelKey as any)}</p>
          <div className="flex flex-col gap-0.5 px-2">
            {cat.fields.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onAdd(type)}
                className="group flex items-center gap-2.5 px-3 py-2 rounded-input text-sm text-navy/70 hover:bg-sky/50 hover:text-navy transition-colors text-left w-full"
              >
                <span className="text-mid shrink-0 group-hover:text-blue transition-colors">
                  {FIELD_ICONS[type]}
                </span>
                <span className="font-light flex-1">{t(FIELD_LABEL_KEYS[type] as any)}</span>
                <span className="opacity-0 group-hover:opacity-100 text-mid transition-opacity shrink-0">
                  <Plus size={11} />
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

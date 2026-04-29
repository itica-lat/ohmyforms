export type FieldType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'number'
  | 'date'
  | 'datetime'
  | 'single_select'
  | 'multi_select'
  | 'file_upload'
  | 'signature'
  | 'section_divider'
  | 'statement'

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'is_empty'
  | 'is_not_empty'

export interface Condition {
  if: {
    fieldId: string
    operator: ConditionOperator
    value: unknown
  }
  action: 'show' | 'hide'
}

export interface FieldDefinition {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  required?: boolean
  helpText?: string
  conditions?: Condition[]
  options?: string[]
  acceptTypes?: string
  content?: string
}

export interface FormSchema {
  id: string
  title: string
  description?: string
  submitLabel: string
  successMessage?: string
  redirectUrl?: string
  accentColor: string
  fields: FieldDefinition[]
  createdAt: string
  updatedAt: string
}

export interface FormResponse {
  id: string
  formId: string
  submittedAt: string
  data: Record<string, unknown>
}

export const FIELD_TYPE_META: Record<
  FieldType,
  { label: string; category: string; hasValue: boolean }
> = {
  short_text: { label: 'Short text', category: 'Text', hasValue: true },
  long_text: { label: 'Long text', category: 'Text', hasValue: true },
  email: { label: 'Email', category: 'Text', hasValue: true },
  number: { label: 'Number', category: 'Text', hasValue: true },
  date: { label: 'Date', category: 'Date & Time', hasValue: true },
  datetime: { label: 'Date & time', category: 'Date & Time', hasValue: true },
  single_select: { label: 'Single select', category: 'Choice', hasValue: true },
  multi_select: { label: 'Multi select', category: 'Choice', hasValue: true },
  file_upload: { label: 'File upload', category: 'Media', hasValue: true },
  signature: { label: 'Signature', category: 'Media', hasValue: true },
  section_divider: { label: 'Section divider', category: 'Layout', hasValue: false },
  statement: { label: 'Statement', category: 'Layout', hasValue: false },
}

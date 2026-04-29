import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FieldDefinition, FormSchema } from '../types/form'
import { nanoid, now } from '../lib/utils'

interface FormStore {
  forms: FormSchema[]
  createForm: (title?: string) => FormSchema
  updateForm: (id: string, updates: Partial<Omit<FormSchema, 'id' | 'createdAt'>>) => void
  deleteForm: (id: string) => void
  getForm: (id: string) => FormSchema | undefined

  addField: (formId: string, type: FieldDefinition['type'], index?: number) => void
  updateField: (formId: string, fieldId: string, updates: Partial<FieldDefinition>) => void
  removeField: (formId: string, fieldId: string) => void
  reorderFields: (formId: string, from: number, to: number) => void
  duplicateField: (formId: string, fieldId: string) => void
}

const DEFAULT_FORM: Omit<FormSchema, 'id' | 'createdAt' | 'updatedAt' | 'title'> = {
  submitLabel: 'Submit',
  successMessage: 'Thank you. Your response has been recorded.',
  accentColor: '#1C4D8D',
  fields: [],
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      forms: [],

      createForm: (title = 'Untitled form') => {
        const form: FormSchema = {
          id: nanoid(),
          title,
          createdAt: now(),
          updatedAt: now(),
          ...DEFAULT_FORM,
        }
        set((s) => ({ forms: [...s.forms, form] }))
        return form
      },

      updateForm: (id, updates) => {
        set((s) => ({
          forms: s.forms.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: now() } : f,
          ),
        }))
      },

      deleteForm: (id) => {
        set((s) => ({ forms: s.forms.filter((f) => f.id !== id) }))
      },

      getForm: (id) => get().forms.find((f) => f.id === id),

      addField: (formId, type, index) => {
        const field: FieldDefinition = {
          id: `field_${nanoid(8)}`,
          type,
          label:
            type === 'section_divider'
              ? 'Section'
              : type === 'statement'
                ? 'Statement'
                : 'Untitled field',
          options: type === 'single_select' || type === 'multi_select' ? ['Option 1'] : undefined,
          content:
            type === 'statement' ? 'Enter your statement text here.' : undefined,
          required: false,
        }
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f
            const fields = [...f.fields]
            if (index != null) {
              fields.splice(index, 0, field)
            } else {
              fields.push(field)
            }
            return { ...f, fields, updatedAt: now() }
          }),
        }))
      },

      updateField: (formId, fieldId, updates) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f
            return {
              ...f,
              updatedAt: now(),
              fields: f.fields.map((field) =>
                field.id === fieldId ? { ...field, ...updates } : field,
              ),
            }
          }),
        }))
      },

      removeField: (formId, fieldId) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f
            return {
              ...f,
              updatedAt: now(),
              fields: f.fields.filter((field) => field.id !== fieldId),
            }
          }),
        }))
      },

      reorderFields: (formId, from, to) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f
            const fields = [...f.fields]
            const [moved] = fields.splice(from, 1)
            if (moved) fields.splice(to, 0, moved)
            return { ...f, fields, updatedAt: now() }
          }),
        }))
      },

      duplicateField: (formId, fieldId) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f
            const idx = f.fields.findIndex((field) => field.id === fieldId)
            if (idx === -1) return f
            const original = f.fields[idx]
            if (!original) return f
            const copy: FieldDefinition = {
              ...original,
              id: `field_${nanoid(8)}`,
              label: `${original.label} (copy)`,
            }
            const fields = [...f.fields]
            fields.splice(idx + 1, 0, copy)
            return { ...f, fields, updatedAt: now() }
          }),
        }))
      },
    }),
    { name: 'ohmyforms-schemas' },
  ),
)

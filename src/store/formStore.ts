import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BannerBlock,
  ExplainerBlock,
  FieldDefinition,
  FieldType,
  FormBlock,
  FormSchema,
  FormSection,
  RatingBlock,
} from "../types/form";
import { nanoid, now } from "../lib/utils";

type LegacyForm = FormSchema & { fields?: FieldDefinition[] };

function migrateFormToSections(form: LegacyForm): FormSchema {
  if (form.sections?.length > 0) return form as FormSchema;
  const fields: FormBlock[] = (form.fields ?? []) as FormBlock[];
  return {
    id: form.id,
    title: form.title,
    description: form.description,
    submitLabel: form.submitLabel ?? "Submit",
    successMessage: form.successMessage,
    redirectUrl: form.redirectUrl,
    accentColor: form.accentColor ?? "#1C4D8D",
    branding: form.branding,
    sections: [
      {
        id: `section_${nanoid(8)}`,
        title: "Main",
        blocks: fields,
      },
    ],
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
  };
}

export type AddableBlockType = FieldType | "banner" | "explainer" | "rating";

function createBlock(type: AddableBlockType): FormBlock {
  const id = `block_${nanoid(8)}`;

  if (type === "banner") {
    const b: BannerBlock = {
      id,
      type: "banner",
      imageUrl: "",
      height: "md",
      objectFit: "cover",
      altText: "",
    };
    return b;
  }

  if (type === "explainer") {
    const b: ExplainerBlock = {
      id,
      type: "explainer",
      heading: "Heading",
      body: "Add your explanation here.",
      style: "default",
    };
    return b;
  }

  if (type === "rating") {
    const b: RatingBlock = {
      id,
      type: "rating",
      label: "Rate your experience",
      required: false,
      ratingStyle: "stars",
      min: 1,
      max: 5,
    };
    return b;
  }

  const fieldType = type as FieldType;
  const field: FieldDefinition = {
    id,
    type: fieldType,
    label:
      fieldType === "section_divider"
        ? "Section"
        : fieldType === "statement"
          ? "Statement"
          : "Untitled field",
    options:
      fieldType === "single_select" || fieldType === "multi_select" ? ["Option 1"] : undefined,
    content: fieldType === "statement" ? "Enter your statement text here." : undefined,
    required: false,
  };
  return field;
}

interface FormStore {
  forms: FormSchema[];

  createForm: (title?: string) => FormSchema;
  updateForm: (id: string, updates: Partial<Omit<FormSchema, "id" | "createdAt">>) => void;
  deleteForm: (id: string) => void;
  getForm: (id: string) => FormSchema | undefined;

  addSection: (formId: string, title?: string) => string;
  updateSection: (
    formId: string,
    sectionId: string,
    updates: Partial<Pick<FormSection, "title" | "description">>,
  ) => void;
  removeSection: (formId: string, sectionId: string) => void;

  addBlock: (formId: string, sectionId: string, type: AddableBlockType, index?: number) => string;
  updateBlock: (
    formId: string,
    sectionId: string,
    blockId: string,
    updates: Partial<FormBlock>,
  ) => void;
  removeBlock: (formId: string, sectionId: string, blockId: string) => void;
  reorderBlocks: (formId: string, sectionId: string, from: number, to: number) => void;
  duplicateBlock: (formId: string, sectionId: string, blockId: string) => void;

  // Legacy — operate on the first section
  addField: (formId: string, type: FieldType, index?: number) => void;
  updateField: (formId: string, fieldId: string, updates: Partial<FieldDefinition>) => void;
  removeField: (formId: string, fieldId: string) => void;
  reorderFields: (formId: string, from: number, to: number) => void;
  duplicateField: (formId: string, fieldId: string) => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      forms: [],

      createForm: (title = "Untitled form") => {
        const form: FormSchema = {
          id: nanoid(),
          title,
          createdAt: now(),
          updatedAt: now(),
          submitLabel: "Submit",
          successMessage: "Thank you. Your response has been recorded.",
          accentColor: "#1C4D8D",
          sections: [
            {
              id: `section_${nanoid(8)}`,
              title: "Main",
              blocks: [],
            },
          ],
        };
        set((s) => ({ forms: [...s.forms, form] }));
        return form;
      },

      updateForm: (id, updates) => {
        set((s) => ({
          forms: s.forms.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: now() } : f)),
        }));
      },

      deleteForm: (id) => {
        set((s) => ({ forms: s.forms.filter((f) => f.id !== id) }));
      },

      getForm: (id) => get().forms.find((f) => f.id === id),

      addSection: (formId, title = "New section") => {
        const id = `section_${nanoid(8)}`;
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            return {
              ...f,
              updatedAt: now(),
              sections: [...f.sections, { id, title, blocks: [] }],
            };
          }),
        }));
        return id;
      },

      updateSection: (formId, sectionId, updates) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            return {
              ...f,
              updatedAt: now(),
              sections: f.sections.map((sec) =>
                sec.id === sectionId ? { ...sec, ...updates } : sec,
              ),
            };
          }),
        }));
      },

      removeSection: (formId, sectionId) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            const sections = f.sections.filter((sec) => sec.id !== sectionId);
            if (sections.length === 0) return f;
            return { ...f, updatedAt: now(), sections };
          }),
        }));
      },

      addBlock: (formId, sectionId, type, index) => {
        const block = createBlock(type);
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            return {
              ...f,
              updatedAt: now(),
              sections: f.sections.map((sec) => {
                if (sec.id !== sectionId) return sec;
                const blocks = [...sec.blocks];
                if (index != null) {
                  blocks.splice(index, 0, block);
                } else {
                  blocks.push(block);
                }
                return { ...sec, blocks };
              }),
            };
          }),
        }));
        return block.id;
      },

      updateBlock: (formId, sectionId, blockId, updates) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            return {
              ...f,
              updatedAt: now(),
              sections: f.sections.map((sec) => {
                if (sec.id !== sectionId) return sec;
                return {
                  ...sec,
                  blocks: sec.blocks.map((b) =>
                    b.id === blockId ? ({ ...b, ...updates } as FormBlock) : b,
                  ),
                };
              }),
            };
          }),
        }));
      },

      removeBlock: (formId, sectionId, blockId) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            return {
              ...f,
              updatedAt: now(),
              sections: f.sections.map((sec) => {
                if (sec.id !== sectionId) return sec;
                return {
                  ...sec,
                  blocks: sec.blocks.filter((b) => b.id !== blockId),
                };
              }),
            };
          }),
        }));
      },

      reorderBlocks: (formId, sectionId, from, to) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            return {
              ...f,
              updatedAt: now(),
              sections: f.sections.map((sec) => {
                if (sec.id !== sectionId) return sec;
                const blocks = [...sec.blocks];
                const [moved] = blocks.splice(from, 1);
                if (moved) blocks.splice(to, 0, moved);
                return { ...sec, blocks };
              }),
            };
          }),
        }));
      },

      duplicateBlock: (formId, sectionId, blockId) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            return {
              ...f,
              updatedAt: now(),
              sections: f.sections.map((sec) => {
                if (sec.id !== sectionId) return sec;
                const idx = sec.blocks.findIndex((b) => b.id === blockId);
                if (idx === -1) return sec;
                const original = sec.blocks[idx];
                if (!original) return sec;
                const copy: FormBlock = {
                  ...original,
                  id: `block_${nanoid(8)}`,
                };
                const blocks = [...sec.blocks];
                blocks.splice(idx + 1, 0, copy);
                return { ...sec, blocks };
              }),
            };
          }),
        }));
      },

      addField: (formId, type, index) => {
        const form = get().forms.find((f) => f.id === formId);
        if (!form || form.sections.length === 0) return;
        const sectionId = form.sections[0].id;
        get().addBlock(formId, sectionId, type, index);
      },

      updateField: (formId, fieldId, updates) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            return {
              ...f,
              updatedAt: now(),
              sections: f.sections.map((sec) => ({
                ...sec,
                blocks: sec.blocks.map((b) =>
                  b.id === fieldId ? ({ ...b, ...updates } as FormBlock) : b,
                ),
              })),
            };
          }),
        }));
      },

      removeField: (formId, fieldId) => {
        set((s) => ({
          forms: s.forms.map((f) => {
            if (f.id !== formId) return f;
            return {
              ...f,
              updatedAt: now(),
              sections: f.sections.map((sec) => ({
                ...sec,
                blocks: sec.blocks.filter((b) => b.id !== fieldId),
              })),
            };
          }),
        }));
      },

      reorderFields: (formId, from, to) => {
        const form = get().forms.find((f) => f.id === formId);
        if (!form || form.sections.length === 0) return;
        const sectionId = form.sections[0].id;
        get().reorderBlocks(formId, sectionId, from, to);
      },

      duplicateField: (formId, fieldId) => {
        const form = get().forms.find((f) => f.id === formId);
        if (!form) return;
        for (const sec of form.sections) {
          if (sec.blocks.some((b) => b.id === fieldId)) {
            get().duplicateBlock(formId, sec.id, fieldId);
            return;
          }
        }
      },
    }),
    {
      name: "ohmyforms-schemas",
      version: 2,
      migrate: (state: unknown, version: number) => {
        const s = state as { forms: LegacyForm[] };
        if (version < 2) {
          return {
            ...s,
            forms: s.forms.map(migrateFormToSections),
          };
        }
        return s;
      },
    },
  ),
);

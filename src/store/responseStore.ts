import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FormResponse } from "../types/form";
import { nanoid, now } from "../lib/utils";

interface ResponseStore {
  responses: FormResponse[];
  submit: (formId: string, data: Record<string, unknown>) => FormResponse;
  getResponses: (formId: string) => FormResponse[];
  deleteResponse: (id: string) => void;
  clearResponses: (formId: string) => void;
}

export const useResponseStore = create<ResponseStore>()(
  persist(
    (set, get) => ({
      responses: [],

      submit: (formId, data) => {
        const response: FormResponse = {
          id: nanoid(),
          formId,
          submittedAt: now(),
          data,
        };
        set((s) => ({ responses: [...s.responses, response] }));
        return response;
      },

      getResponses: (formId) =>
        get()
          .responses.filter((r) => r.formId === formId)
          .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)),

      deleteResponse: (id) => {
        set((s) => ({ responses: s.responses.filter((r) => r.id !== id) }));
      },

      clearResponses: (formId) => {
        set((s) => ({ responses: s.responses.filter((r) => r.formId !== formId) }));
      },
    }),
    { name: "ohmyforms-responses" },
  ),
);

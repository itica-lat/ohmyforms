/**
 * OhMyForms API client
 *
 * In dev mode (Vite), `/api` requests are proxied to localhost:3002.
 * In production, nginx proxies /api to the backend.
 */

import type { FormSchema, FormResponse } from "../types/form";

const BASE = "/api";

async function handleResponse<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: resp.statusText }));
    throw new Error(body.error || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export const api = {
  async listForms(): Promise<FormSchema[]> {
    return handleResponse<FormSchema[]>(await fetch(`${BASE}/forms`));
  },

  async getForm(id: string): Promise<FormSchema> {
    return handleResponse<FormSchema>(await fetch(`${BASE}/form/${id}`));
  },

  async createForm(data: Partial<FormSchema>): Promise<FormSchema> {
    return handleResponse<FormSchema>(
      await fetch(`${BASE}/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  },

  async updateForm(id: string, data: Partial<FormSchema>): Promise<FormSchema> {
    return handleResponse<FormSchema>(
      await fetch(`${BASE}/form/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  },

  async deleteForm(id: string): Promise<void> {
    await fetch(`${BASE}/form/${id}`, { method: "DELETE" });
  },

  async submitResponse(formId: string, data: Record<string, unknown>): Promise<FormResponse> {
    return handleResponse<FormResponse>(
      await fetch(`${BASE}/form/${formId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      }),
    );
  },

  async getResponses(formId: string): Promise<FormResponse[]> {
    return handleResponse<FormResponse[]>(
      await fetch(`${BASE}/form/${formId}/responses`),
    );
  },

  async deleteResponse(formId: string, responseId: string): Promise<void> {
    await fetch(`${BASE}/form/${formId}/responses/${responseId}`, { method: "DELETE" });
  },

  async clearResponses(formId: string): Promise<void> {
    await fetch(`${BASE}/form/${formId}/responses`, { method: "DELETE" });
  },
};

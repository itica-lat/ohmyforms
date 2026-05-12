import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = process.env.DATA_DIR || "/home/hermes/srv-data/ohmyforms";
const PORT = parseInt(process.env.PORT || "3002", 10);
const FORMS_FILE = path.join(DATA_DIR, "forms.json");
const RESPONSES_DIR = path.join(DATA_DIR, "responses");

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(RESPONSES_DIR, { recursive: true });
  if (!existsSync(FORMS_FILE)) {
    await writeFile(FORMS_FILE, "{}", "utf-8");
  }
}

async function readForms(): Promise<Record<string, any>> {
  try {
    const raw = await readFile(FORMS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeForms(forms: Record<string, any>) {
  await writeFile(FORMS_FILE, JSON.stringify(forms, null, 2), "utf-8");
}

async function readResponses(formId: string): Promise<any[]> {
  const file = path.join(RESPONSES_DIR, `${formId}.json`);
  try {
    const raw = await readFile(file, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeResponses(formId: string, responses: any[]) {
  const file = path.join(RESPONSES_DIR, `${formId}.json`);
  await writeFile(file, JSON.stringify(responses, null, 2), "utf-8");
}

function nanoid(size = 21): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
  const bytes = crypto.randomBytes(size);
  let id = "";
  for (let i = 0; i < size; i++) {
    id += chars[bytes[i]! & 63];
  }
  return id;
}

function now(): string {
  return new Date().toISOString();
}

await ensureDir();

const app = new Elysia()
  .use(cors())
  .onError(({ code, error }) => {
    console.error(`[${code}] ${error}`);
    return { error: error.message };
  })

  .get("/api/forms", async () => {
    const forms = await readForms();
    return Object.values(forms).sort(
      (a: any, b: any) => (a.updatedAt < b.updatedAt ? 1 : -1),
    );
  })

  .get("/api/form/:id", async ({ params: { id }, set }) => {
    const forms = await readForms();
    const form = forms[id];
    if (!form) {
      set.status = 404;
      return { error: "Form not found" };
    }
    return form;
  })

  .post("/api/form", async ({ body, set }: any) => {
    const { title, ...rest } = body || {};
    if (!title || typeof title !== "string") {
      set.status = 400;
      return { error: "Title is required" };
    }
    const id = nanoid();
    const form = {
      id,
      title,
      submitLabel: "Submit",
      successMessage: "Thank you. Your response has been recorded.",
      accentColor: "#1C4D8D",
      sections: [{ id: `section_${nanoid(8)}`, title: "Main", blocks: [] }],
      createdAt: now(),
      updatedAt: now(),
      ...rest,
      id, // keep original id
    };
    const forms = await readForms();
    forms[id] = form;
    await writeForms(forms);
    return form;
  })

  .put("/api/form/:id", async ({ params: { id }, body, set }: any) => {
    const forms = await readForms();
    if (!forms[id]) {
      set.status = 404;
      return { error: "Form not found" };
    }
    const updated = {
      ...forms[id],
      ...body,
      id,
      updatedAt: now(),
    };
    forms[id] = updated;
    await writeForms(forms);
    return updated;
  })

  .delete("/api/form/:id", async ({ params: { id }, set }) => {
    const forms = await readForms();
    if (!forms[id]) {
      set.status = 404;
      return { error: "Form not found" };
    }
    delete forms[id];
    await writeForms(forms);
    return { success: true };
  })

  .post("/api/form/:id/submit", async ({ params: { id }, body, set }: any) => {
    const forms = await readForms();
    const form = forms[id];
    if (!form) {
      set.status = 404;
      return { error: "Form not found" };
    }
    const data = body?.data || body || {};
    const response = {
      id: nanoid(),
      formId: id,
      submittedAt: now(),
      data,
    };
    const responses = await readResponses(id);
    responses.push(response);
    await writeResponses(id, responses);
    return response;
  })

  .get("/api/form/:id/responses", async ({ params: { id }, set }) => {
    const forms = await readForms();
    if (!forms[id]) {
      set.status = 404;
      return { error: "Form not found" };
    }
    const responses = await readResponses(id);
    return responses.sort(
      (a: any, b: any) => (a.submittedAt < b.submittedAt ? 1 : -1),
    );
  })

  .delete("/api/form/:id/responses/:responseId", async ({ params: { id, responseId }, set }) => {
    const responses = await readResponses(id);
    const idx = responses.findIndex((r: any) => r.id === responseId);
    if (idx === -1) {
      set.status = 404;
      return { error: "Response not found" };
    }
    responses.splice(idx, 1);
    await writeResponses(id, responses);
    return { success: true };
  })

  .delete("/api/form/:id/responses", async ({ params: { id } }) => {
    await writeResponses(id, []);
    return { success: true };
  })

  .listen(PORT, () => {
    console.log(`OhMyForms API running on http://localhost:${PORT}`);
    console.log(`Data directory: ${DATA_DIR}`);
  });

export type App = typeof app;

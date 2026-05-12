import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { api } from "../lib/api";
import type { FormSchema, FormResponse } from "../types/form";
import { ResponseTable } from "../components/responses/ResponseTable";

export function ResponsesPage() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FormSchema | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    Promise.all([api.getForm(formId), api.getResponses(formId)])
      .then(([f, r]) => {
        setForm(f);
        setResponses(r);
      })
      .catch(() => setForm(null))
      .finally(() => setLoading(false));
  }, [formId]);

  async function handleDelete(responseId: string) {
    if (!formId) return;
    await api.deleteResponse(formId, responseId);
    setResponses((prev) => prev.filter((r) => r.id !== responseId));
  }

  async function handleClear() {
    if (!formId) return;
    await api.clearResponses(formId);
    setResponses([]);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-svh">
        <p className="text-navy/40 font-light text-sm">Loading...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center min-h-svh gap-2">
        <p className="text-navy/40 font-light">Form not found</p>
        <Link to="/" className="text-blue text-sm hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-svh overflow-hidden bg-white">
      <header className="flex items-center gap-3 px-6 py-3 border-b border-[rgba(73,136,196,0.15)] shrink-0">
        <Link to="/" className="text-mid hover:text-navy transition-colors">
          <ChevronLeft size={16} />
        </Link>
        <span className="font-normal text-navy text-sm">{form.title}</span>
        <span className="label-meta text-mid/50 ml-1">/ Responses</span>
        <Link
          to={`/builder/${form.id}`}
          className="ml-auto text-sm text-mid hover:text-navy transition-colors font-light"
        >
          Edit form
        </Link>
      </header>

      <div className="flex-1 overflow-hidden">
        <ResponseTable
          form={form}
          responses={responses}
          onDelete={handleDelete}
          onClear={handleClear}
        />
      </div>
    </div>
  );
}

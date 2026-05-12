import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FormEmbed } from "../components/renderer/FormEmbed";
import { api } from "../lib/api";
import type { FormSchema } from "../types/form";

export function EmbedPage() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FormSchema | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    api
      .getForm(formId)
      .then(setForm)
      .catch(() => setForm(null))
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-navy/40 font-light text-sm">Loading...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-navy/40 font-light text-sm">Form not found</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <FormEmbed form={form} />
    </div>
  );
}

import { X } from "lucide-react";
import type { FormSchema } from "../../types/form";
import { Input, Textarea } from "../ui/Input";

interface FormSettingsPanelProps {
  form: FormSchema;
  onChange: (updates: Partial<Omit<FormSchema, "id" | "createdAt">>) => void;
  onClose: () => void;
}

export function FormSettingsPanel({ form, onChange, onClose }: FormSettingsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(73,136,196,0.15)]">
        <p className="label-meta">Form settings</p>
        <button type="button" onClick={onClose} className="text-mid hover:text-navy">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />

        <Textarea
          label="Description"
          value={form.description ?? ""}
          rows={3}
          placeholder="Describe the purpose of this form"
          onChange={(e) => onChange({ description: e.target.value })}
        />

        <Input
          label="Submit button label"
          value={form.submitLabel}
          onChange={(e) => onChange({ submitLabel: e.target.value })}
        />

        <Textarea
          label="Success message"
          value={form.successMessage ?? ""}
          rows={2}
          placeholder="Thank you. Your response has been recorded."
          onChange={(e) => onChange({ successMessage: e.target.value })}
        />

        <Input
          label="Redirect URL (optional)"
          value={form.redirectUrl ?? ""}
          placeholder="https://example.com/thank-you"
          hint="If set, the user is redirected here after submission."
          onChange={(e) => onChange({ redirectUrl: e.target.value })}
        />

        <div className="flex flex-col gap-1">
          <p className="label-meta">Accent color</p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.accentColor}
              onChange={(e) => onChange({ accentColor: e.target.value })}
              className="w-8 h-8 rounded-tag border border-[rgba(73,136,196,0.25)] cursor-pointer p-0.5 bg-white"
            />
            <span className="font-mono text-sm text-navy/70">{form.accentColor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

const baseInput =
  "w-full rounded-input border border-[rgba(73,136,196,0.25)] bg-white px-3 py-2 text-sm text-navy placeholder:text-mid/60 focus:outline-none focus:border-mid transition-colors";

export function Input({ label, hint, error, className = "", id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="label-meta">
          {label}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={[baseInput, error ? "border-red-400" : "", className].join(" ")}
      />
      {hint && !error && <p className="text-[11px] text-mid/70">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className = "",
  id,
  rows = 3,
  ...props
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="label-meta">
          {label}
        </label>
      )}
      <textarea
        id={id}
        rows={rows}
        {...props}
        className={[baseInput, "resize-y", error ? "border-red-400" : "", className].join(" ")}
      />
      {hint && !error && <p className="text-[11px] text-mid/70">{hint}</p>}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  );
}

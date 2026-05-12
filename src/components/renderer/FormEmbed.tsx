import { useState } from "react";
import { CheckCircle } from "lucide-react";
import type { FormSchema, FormBlock } from "../../types/form";
import { isDataBlock } from "../../types/form";
import { getVisibleBlocks } from "../../lib/conditionalEngine";
import { FieldRenderer } from "./FieldRenderer";
import { useResponseStore } from "../../store/responseStore";

interface FormEmbedProps {
  form: FormSchema;
  onSubmit?: (data: Record<string, unknown>) => void;
  preview?: boolean;
}

function getTitleClass(style: string): string {
  switch (style) {
    case "display":
      return "text-2xl font-serif italic text-[#0f2854] tracking-tight leading-snug mb-2";
    case "mono":
      return "text-xl font-mono uppercase tracking-widest text-[#0f2854] mb-2";
    default:
      return "text-2xl font-medium text-[#0f2854] tracking-tight leading-snug mb-2";
  }
}

export function FormEmbed({ form, onSubmit, preview = false }: FormEmbedProps) {
  const submit = useResponseStore((s) => s.submit);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const branding = form.branding;
  const accentColor = branding?.primaryColor ?? form.accentColor;
  const fontFamily = branding?.fontFamily ?? "DM Sans";
  const titleStyle = branding?.titleStyle ?? "default";

  const allBlocks: FormBlock[] = form.sections.flatMap((s) => s.blocks);
  const visibleBlocks = getVisibleBlocks(allBlocks, values);

  function setValue(blockId: string, value: unknown) {
    setValues((prev) => ({ ...prev, [blockId]: value }));
    if (errors[blockId]) setErrors((prev) => ({ ...prev, [blockId]: "" }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (preview) return;

    const newErrors: Record<string, string> = {};
    for (const block of visibleBlocks) {
      if (!isDataBlock(block)) continue;

      const hasRequired = "required" in block && block.required === true;
      if (!hasRequired) continue;

      const val = values[block.id];
      const isEmpty = val == null || val === "" || (Array.isArray(val) && val.length === 0);

      if (isEmpty) {
        newErrors[block.id] = "Required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (onSubmit) {
      onSubmit(values);
    } else {
      submit(form.id, values);
    }

    if (form.redirectUrl) {
      window.location.href = form.redirectUrl;
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-20 text-center"
        style={{ fontFamily }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}18` }}
        >
          <CheckCircle size={24} style={{ color: accentColor }} />
        </div>
        <h2 className="text-xl font-medium text-navy tracking-tight">
          {form.successMessage || "Thank you. Your response has been recorded."}
        </h2>
      </div>
    );
  }

  const hasDataBlocks = visibleBlocks.some(isDataBlock);

  return (
    <div
      className="w-full max-w-2xl mx-auto py-12 px-6"
      style={
        {
          fontFamily,
          "--form-primary": accentColor,
        } as React.CSSProperties
      }
    >
      {/* Form header */}
      {(form.title || form.description || branding?.logoUrl) && (
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt="Logo" className="h-7 w-auto object-contain" />
            ) : (
              <>
                <div className="h-px w-6 bg-rule" />
                <span className="label-meta text-navy/30">Form</span>
              </>
            )}
          </div>

          <div>
            {form.title && <h1 className={getTitleClass(titleStyle)}>{form.title}</h1>}
            {form.description && (
              <p className="text-sm text-navy/55 font-light leading-relaxed">{form.description}</p>
            )}
          </div>

          <div className="tick-rule-sm w-full" />
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {form.sections.map((section, sectionIdx) => {
          const sectionBlocks = getVisibleBlocks(section.blocks, values);
          if (sectionBlocks.length === 0) return null;

          return (
            <div key={section.id} className={sectionIdx > 0 ? "mt-10" : ""}>
              {/* Section header (only if multiple sections or title is non-default) */}
              {(form.sections.length > 1 || section.title !== "Main") && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px w-4 bg-rule" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-mid/60">
                      {section.title}
                    </span>
                  </div>
                  {section.description && (
                    <p className="text-[12px] text-navy/45 font-light">{section.description}</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-6">
                {sectionBlocks.map((block) => (
                  <FieldRenderer
                    key={block.id}
                    block={block}
                    value={values[block.id]}
                    onChange={(v) => setValue(block.id, v)}
                    accentColor={accentColor}
                    error={errors[block.id]}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {!preview && hasDataBlocks && (
          <button
            type="submit"
            className="mt-8 px-6 py-2.5 rounded-input text-sm font-normal text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            {form.submitLabel || "Submit"}
          </button>
        )}

        {preview && (
          <div className="mt-8">
            <button
              type="button"
              className="px-6 py-2.5 rounded-input text-sm font-normal text-white opacity-70 cursor-default"
              style={{ backgroundColor: accentColor }}
            >
              {form.submitLabel || "Submit"}
            </button>
            <p className="mt-2 text-[11px] text-mid/60 font-mono uppercase tracking-widest">
              Preview mode — submission disabled
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

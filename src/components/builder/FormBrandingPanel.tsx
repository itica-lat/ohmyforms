import { X } from "lucide-react";
import type { FormSchema, FormBranding, BrandingFont } from "../../types/form";
import { Input } from "../ui/Input";

interface FormBrandingPanelProps {
  form: FormSchema;
  onChange: (updates: Partial<FormSchema>) => void;
  onClose: () => void;
}

const FONTS: { value: BrandingFont; label: string; preview: string }[] = [
  { value: "DM Sans", label: "DM Sans", preview: "font-sans" },
  { value: "DM Mono", label: "DM Mono", preview: "font-mono" },
  { value: "DM Serif Display", label: "DM Serif Display", preview: "font-serif" },
  { value: "Inter", label: "Inter", preview: "" },
  { value: "Roboto Mono", label: "Roboto Mono", preview: "" },
  { value: "Playfair Display", label: "Playfair Display", preview: "" },
];

const TITLE_STYLES: {
  value: FormBranding["titleStyle"];
  label: string;
  description: string;
}[] = [
  { value: "default", label: "Default", description: "DM Sans medium" },
  { value: "display", label: "Display", description: "DM Serif Display italic" },
  { value: "mono", label: "Mono", description: "DM Mono uppercase" },
];

const DEFAULT_BRANDING: FormBranding = {
  primaryColor: "#1C4D8D",
  fontFamily: "DM Sans",
  titleStyle: "default",
};

export function FormBrandingPanel({ form, onChange, onClose }: FormBrandingPanelProps) {
  const branding: FormBranding = form.branding ?? {
    ...DEFAULT_BRANDING,
    primaryColor: form.accentColor,
  };

  function update(updates: Partial<FormBranding>) {
    onChange({ branding: { ...branding, ...updates } });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(73,136,196,0.15)]">
        <p className="label-meta">Branding</p>
        <button type="button" onClick={onClose} className="text-mid hover:text-navy">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
        {/* Primary color */}
        <div className="flex flex-col gap-2">
          <p className="label-meta">Primary color</p>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={branding.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value })}
              className="w-9 h-9 rounded-input border border-rule cursor-pointer p-0.5 bg-white"
            />
            <input
              type="text"
              value={branding.primaryColor}
              onChange={(e) => {
                if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                  update({ primaryColor: e.target.value });
                }
              }}
              className="flex-1 font-mono text-sm border border-[rgba(73,136,196,0.25)] rounded-input px-2 py-1.5 text-navy bg-white"
              maxLength={7}
            />
          </div>
          <p className="text-[11px] text-mid/60">Used for buttons, focus states, and accents.</p>
        </div>

        {/* Font family */}
        <div className="flex flex-col gap-2">
          <p className="label-meta">Font family</p>
          <div className="flex flex-col gap-1">
            {FONTS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => update({ fontFamily: f.value })}
                className={[
                  "flex items-center justify-between px-3 py-2 rounded-input border transition-colors text-left",
                  branding.fontFamily === f.value
                    ? "border-blue bg-blue/5"
                    : "border-rule hover:border-mid/40",
                ].join(" ")}
              >
                <span className="text-sm text-navy" style={{ fontFamily: f.value }}>
                  {f.label}
                </span>
                {branding.fontFamily === f.value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Logo URL */}
        <Input
          label="Logo URL (optional)"
          value={branding.logoUrl ?? ""}
          placeholder="https://example.com/logo.png"
          hint="Shown top-left in the form header."
          onChange={(e) => update({ logoUrl: e.target.value || undefined })}
        />

        {/* Title style */}
        <div className="flex flex-col gap-2">
          <p className="label-meta">Form title style</p>
          <div className="flex flex-col gap-1">
            {TITLE_STYLES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => update({ titleStyle: s.value })}
                className={[
                  "flex items-center justify-between px-3 py-2.5 rounded-input border transition-colors text-left",
                  branding.titleStyle === s.value
                    ? "border-blue bg-blue/5"
                    : "border-rule hover:border-mid/40",
                ].join(" ")}
              >
                <div>
                  <p className="text-sm text-navy font-normal">{s.label}</p>
                  <p className="text-[11px] text-mid/60">{s.description}</p>
                </div>
                {branding.titleStyle === s.value && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <button
          type="button"
          onClick={() => onChange({ branding: undefined })}
          className="text-[11px] label-meta text-mid/60 hover:text-navy transition-colors self-start"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Plus, FileText, ArrowRight, Layers, GitBranch, Table2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { SectionDivider } from "../components/ui/SectionDivider";
import { formatDateShort } from "../lib/utils";
import { api } from "../lib/api";
import type { FormSchema } from "../types/form";
import { getAllBlocks } from "../types/form";

export function HomePage() {
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadForms() {
    setLoading(true);
    try {
      const list = await api.listForms();
      setForms(list);
    } catch {
      // silently fail, forms will be empty
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadForms();
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      const form = await api.createForm({ title: "Untitled form" });
      navigate(`/builder/${form.id}`);
    } catch {
      // fallback: create locally
      setCreating(false);
    }
  }

  return (
    <div className="min-h-svh bg-white flex flex-col">
      {/* Top nav */}
      <header className="border-b border-rule px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium text-navy text-sm tracking-tight">OhMyForms</span>
          <span className="text-rule border-l border-rule pl-3 label-meta text-mid/50">
            by Eternum
          </span>
        </div>
        <Button variant="primary" size="sm" onClick={handleCreate} disabled={creating}>
          <Plus size={13} />
          New form
        </Button>
      </header>

      {/* Tick decoration below header */}
      <div className="tick-rule w-full" />

      <main className="flex-1 max-w-3xl mx-auto w-full px-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={20} className="text-mid/40 animate-spin" />
          </div>
        ) : forms.length === 0 ? (
          <WelcomeHero onCreate={handleCreate} />
        ) : (
          <FormsList
            forms={[...forms]}
            onNavigate={navigate}
            onCreate={handleCreate}
          />
        )}
      </main>

      {/* Footer tick */}
      <div className="tick-rule-sm w-full mt-auto" />
      <footer className="py-3 text-center border-t border-rule">
        <span className="label-meta text-navy/25">OhMyForms · Eternum</span>
      </footer>
    </div>
  );
}

function WelcomeHero({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="py-20 flex flex-col gap-12">
      {/* Hero text */}
      <div className="flex flex-col gap-6">
        <SectionDivider label="OhMyForms" />

        <div className="text-center flex flex-col gap-3">
          <h1 className="text-4xl font-medium text-navy tracking-tight leading-[1.15]">
            Build forms that feel
            <br />
            <em
              className="font-serif italic font-normal text-blue not-italic"
              style={{ fontStyle: "italic" }}
            >
              like documents.
            </em>
          </h1>
          <p className="text-sm text-navy/50 font-light max-w-sm mx-auto leading-relaxed">
            Professional forms, surveys, and onboarding flows. Built for teams who care about the
            details.
          </p>
        </div>
      </div>

      {/* Tick decoration */}
      <div className="tick-rule w-full" />

      {/* Feature strip */}
      <div className="grid grid-cols-3 gap-6">
        <FeatureItem
          icon={<Layers size={16} />}
          title="12 field types"
          desc="Text, selects, file upload, signatures, and layout blocks."
        />
        <FeatureItem
          icon={<GitBranch size={16} />}
          title="Conditional logic"
          desc="Show or hide fields based on any previous answer."
        />
        <FeatureItem
          icon={<Table2 size={16} />}
          title="Responses table"
          desc="Browse, search, and export submissions to CSV."
        />
      </div>

      {/* Tick decoration */}
      <div className="tick-rule w-full" />

      {/* CTA */}
      <div className="flex flex-col items-center gap-4">
        <SectionDivider label="Get started" />
        <div className="flex flex-col items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onCreate}
            className="group flex items-center gap-2 text-sm text-blue hover:text-navy transition-colors font-normal"
          >
            Create your first form
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="text-[11px] text-navy/30 label-meta">No account required</p>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 text-mid">
        {icon}
        <span className="label-meta text-navy/60">{title}</span>
      </div>
      <p className="text-[12px] text-navy/45 font-light leading-relaxed">{desc}</p>
    </div>
  );
}

function FormsList({
  forms,
  onNavigate,
  onCreate,
}: {
  forms: FormSchema[];
  onNavigate: ReturnType<typeof useNavigate>;
  onCreate: () => void;
}) {
  return (
    <div className="py-12 flex flex-col gap-8">
      {/* Section header */}
      <div className="flex items-center gap-4">
        <SectionDivider label="Forms" className="flex-1" />
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-1.5 label-meta text-mid hover:text-navy transition-colors shrink-0"
        >
          <Plus size={11} />
          New
        </button>
      </div>

      {/* Form cards */}
      <div className="flex flex-col gap-2">
        {forms.map((form) => {
          const blockCount = getAllBlocks(form).length;
          return (
            <div
              key={form.id}
              className="group flex items-center gap-4 px-5 py-4 rounded-card border border-rule hover:border-mid/40 transition-colors bg-white"
            >
              {/* Color swatch */}
              <div
                className="w-7 h-7 rounded-input shrink-0 flex items-center justify-center text-white"
                style={{ backgroundColor: form.accentColor }}
              >
                <FileText size={13} />
              </div>

              {/* Meta */}
              <div className="flex-1 min-w-0">
                <p className="font-normal text-navy text-sm truncate">{form.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="label-meta text-navy/30">
                    {blockCount} block{blockCount !== 1 ? "s" : ""}
                  </span>
                  <span className="label-meta text-navy/20">·</span>
                  <span className="label-meta text-navy/30">{formatDateShort(form.updatedAt)}</span>
                </div>
              </div>

              {/* Actions — visible on hover */}
              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onNavigate(`/responses/${form.id}`)}
                >
                  Responses
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onNavigate(`/builder/${form.id}`)}
                >
                  Edit
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative end rule */}
      <div className="tick-rule-sm w-full" />

      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={onCreate}
          className="group flex items-center gap-2 text-[12px] text-mid/60 hover:text-navy transition-colors label-meta"
        >
          <Plus size={11} />
          New form
        </button>
      </div>
    </div>
  );
}

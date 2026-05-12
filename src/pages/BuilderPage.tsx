import { useState, useCallback, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {
  Settings,
  Eye,
  BarChart2,
  ChevronLeft,
  Share2,
  Palette,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { useFormStore } from "../store/formStore";
import type { AddableBlockType } from "../store/formStore";
import { useResponseStore } from "../store/responseStore";
import type { FormBlock } from "../types/form";
import { FieldTypePicker } from "../components/builder/FieldTypePicker";
import { FieldCard } from "../components/builder/FieldCard";
import { FieldSettingsPanel } from "../components/builder/FieldSettingsPanel";
import { FormSettingsPanel } from "../components/builder/FormSettingsPanel";
import { FormBrandingPanel } from "../components/builder/FormBrandingPanel";
import { FormEmbed } from "../components/renderer/FormEmbed";
import { ResponseTable } from "../components/responses/ResponseTable";
import { Button } from "../components/ui/Button";

type Tab = "build" | "preview" | "responses" | "share";
type RightPanel = "block" | "form" | "branding" | null;

export function BuilderPage() {
  const { formId } = useParams<{ formId: string }>();

  const form = useFormStore((s) => s.getForm(formId ?? ""));
  const updateForm = useFormStore((s) => s.updateForm);
  const addSection = useFormStore((s) => s.addSection);
  const updateSection = useFormStore((s) => s.updateSection);
  const removeSection = useFormStore((s) => s.removeSection);
  const addBlock = useFormStore((s) => s.addBlock);
  const updateBlock = useFormStore((s) => s.updateBlock);
  const removeBlock = useFormStore((s) => s.removeBlock);
  const reorderBlocks = useFormStore((s) => s.reorderBlocks);
  const duplicateBlock = useFormStore((s) => s.duplicateBlock);

  const allResponses = useResponseStore((s) => s.responses);
  const deleteResponse = useResponseStore((s) => s.deleteResponse);
  const clearResponses = useResponseStore((s) => s.clearResponses);
  const responses = useMemo(
    () =>
      allResponses
        .filter((r) => r.formId === formId)
        .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)),
    [allResponses, formId],
  );

  const [tab, setTab] = useState<Tab>("build");
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [rightPanel, setRightPanel] = useState<RightPanel>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const activeSectionId = selectedSectionId ?? form?.sections[0]?.id ?? null;

  const activeSection = form?.sections.find((s) => s.id === activeSectionId) ?? null;

  const selectedBlock = selectedBlockId
    ? (activeSection?.blocks.find((b) => b.id === selectedBlockId) ?? null)
    : null;

  // Also search other sections for the selected block
  const selectedBlockFromAll =
    selectedBlockId && form
      ? (form.sections.flatMap((s) => s.blocks).find((b) => b.id === selectedBlockId) ?? null)
      : null;

  const allBlocksInForm: FormBlock[] = form?.sections.flatMap((s) => s.blocks) ?? [];

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (!form || !formId || !activeSectionId) return;
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const sec = form.sections.find((s) => s.id === activeSectionId);
      if (!sec) return;
      const from = sec.blocks.findIndex((b) => b.id === active.id);
      const to = sec.blocks.findIndex((b) => b.id === over.id);
      if (from !== -1 && to !== -1) reorderBlocks(formId, activeSectionId, from, to);
    },
    [form, formId, activeSectionId, reorderBlocks],
  );

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center h-svh text-navy/40">
        <p>Form not found.</p>
        <Link to="/" className="text-blue text-sm mt-2 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  function handleAddBlock(type: AddableBlockType) {
    if (!formId || !activeSectionId) return;
    const newId = addBlock(formId, activeSectionId, type);
    setSelectedBlockId(newId);
    setRightPanel("block");
  }

  function handleSelectBlock(blockId: string, sectionId: string) {
    setSelectedBlockId(blockId);
    setSelectedSectionId(sectionId);
    setRightPanel("block");
  }

  function handleClosePanel() {
    setSelectedBlockId(null);
    setRightPanel(null);
  }

  function handleUpdateBlock(updates: Partial<FormBlock>) {
    if (!formId || !selectedBlockId) return;
    const sec = form?.sections.find((s) => s.blocks.some((b) => b.id === selectedBlockId));
    if (!sec) return;
    updateBlock(formId, sec.id, selectedBlockId, updates);
  }

  function toggleSection(sectionId: string) {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  function handleAddSection() {
    if (!formId) return;
    const newId = addSection(formId);
    setSelectedSectionId(newId);
    setExpandedSections((prev) => new Set([...prev, newId]));
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "build", label: "Build", icon: null },
    { id: "preview", label: "Preview", icon: <Eye size={13} /> },
    { id: "responses", label: `Responses (${responses.length})`, icon: <BarChart2 size={13} /> },
    { id: "share", label: "Share", icon: <Share2 size={13} /> },
  ];

  const totalBlocks = form.sections.reduce((acc, s) => acc + s.blocks.length, 0);

  return (
    <div className="flex flex-col h-svh overflow-hidden bg-white">
      {/* Top nav */}
      <header className="flex items-center gap-4 px-5 py-3 border-b border-rule shrink-0">
        <Link to="/" className="text-mid hover:text-navy transition-colors shrink-0">
          <ChevronLeft size={16} />
        </Link>

        <input
          type="text"
          value={form.title}
          onChange={(e) => updateForm(form.id, { title: e.target.value })}
          className="font-normal text-navy text-sm bg-transparent border-none focus:outline-none min-w-0 flex-1 max-w-65"
          placeholder="Untitled form"
        />

        <nav className="flex items-center gap-0.5 ml-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-input text-sm transition-colors",
                tab === t.id
                  ? "bg-sky/50 text-navy font-normal"
                  : "text-mid hover:text-navy hover:bg-sky/30 font-light",
              ].join(" ")}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRightPanel(rightPanel === "branding" ? null : "branding")}
          >
            <Palette size={13} />
            Branding
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRightPanel(rightPanel === "form" ? null : "form")}
          >
            <Settings size={13} />
            Settings
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => window.open(`/form/${form.id}`, "_blank")}
          >
            Open form
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — only on build tab */}
        {tab === "build" && (
          <aside className="w-56 border-r border-rule overflow-y-auto shrink-0 bg-white flex flex-col">
            {/* Sections tree */}
            <div className="shrink-0">
              <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                <p className="label-meta text-navy/40">Sections</p>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="text-mid hover:text-navy transition-colors"
                  title="Add section"
                >
                  <Plus size={12} />
                </button>
              </div>

              <div className="px-2 pb-2 flex flex-col gap-0.5">
                {form.sections.map((section) => {
                  const isActive = activeSectionId === section.id;
                  const isExpanded = expandedSections.has(section.id);

                  return (
                    <div key={section.id}>
                      <div
                        className={[
                          "group flex items-center gap-1.5 px-2 py-1.5 rounded-input cursor-pointer transition-colors",
                          isActive
                            ? "bg-sky/40 text-navy"
                            : "text-navy/60 hover:bg-sky/20 hover:text-navy",
                        ].join(" ")}
                        onClick={() => {
                          setSelectedSectionId(section.id);
                          setSelectedBlockId(null);
                          setRightPanel(null);
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSection(section.id);
                          }}
                          className="text-mid/50 hover:text-navy shrink-0"
                        >
                          {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                        </button>
                        <span className="text-[12px] font-normal flex-1 truncate">
                          {section.title}
                        </span>
                        <span className="label-meta text-navy/30 shrink-0">
                          {section.blocks.length}
                        </span>
                        {form.sections.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (formId) removeSection(formId, section.id);
                              if (activeSectionId === section.id) {
                                setSelectedSectionId(null);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 text-mid/50 hover:text-red-500 transition-all shrink-0"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>

                      {/* Expanded block list */}
                      {isExpanded && section.blocks.length > 0 && (
                        <div className="ml-5 mt-0.5 mb-1 flex flex-col gap-0.5">
                          {section.blocks.map((block) => {
                            const b = block as any;
                            const label =
                              "label" in b
                                ? b.label
                                : b.type === "banner"
                                  ? "Banner"
                                  : b.type === "explainer"
                                    ? "Explainer"
                                    : b.type;
                            return (
                              <button
                                key={block.id}
                                type="button"
                                onClick={() => handleSelectBlock(block.id, section.id)}
                                className={[
                                  "text-left px-2 py-1 rounded-tag text-[11px] truncate transition-colors",
                                  selectedBlockId === block.id
                                    ? "bg-blue/10 text-navy"
                                    : "text-navy/50 hover:bg-sky/20 hover:text-navy",
                                ].join(" ")}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="px-4 pt-2 pb-3 border-t border-rule shrink-0">
              <p className="label-meta text-navy/40 pt-2">Add block</p>
            </div>

            {/* Block type picker */}
            <div className="flex-1 overflow-y-auto">
              <FieldTypePicker onAdd={handleAddBlock} />
            </div>
          </aside>
        )}

        {/* Builder canvas or other views */}
        <div className="flex-1 overflow-hidden flex">
          {tab === "build" && (
            <div className="flex-1 overflow-y-auto p-6">
              {totalBlocks === 0 ? (
                <div className="flex flex-col items-center justify-center gap-6 py-24 text-center max-w-xs mx-auto">
                  <div className="tick-rule w-full" />
                  <div className="flex flex-col gap-2">
                    <p className="font-serif italic text-xl text-navy/30">Start with a block.</p>
                    <p className="text-xs text-mid/50 font-light">
                      Pick a type from the sidebar to add your first block.
                    </p>
                  </div>
                  <div className="tick-rule w-full" />
                </div>
              ) : (
                <div className="flex flex-col gap-8 max-w-xl mx-auto">
                  {form.sections.map((section) => (
                    <div key={section.id}>
                      {/* Section header */}
                      <div
                        className={["flex items-center gap-3 mb-3 group cursor-pointer"].join(" ")}
                        onClick={() => {
                          setSelectedSectionId(section.id);
                          setSelectedBlockId(null);
                          setRightPanel(null);
                        }}
                      >
                        <div
                          className={[
                            "flex-1 px-3 py-2 rounded-input border transition-colors",
                            activeSectionId === section.id
                              ? "border-blue/40 bg-blue/5"
                              : "border-transparent hover:border-rule hover:bg-sky/10",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-px w-4 bg-rule shrink-0" />
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => {
                                if (formId)
                                  updateSection(formId, section.id, {
                                    title: e.target.value,
                                  });
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="label-meta text-navy/50 bg-transparent border-none focus:outline-none flex-1 min-w-0"
                              placeholder="Section title"
                            />
                          </div>
                          {section.description && (
                            <p className="text-[11px] text-navy/35 font-light mt-0.5 pl-6">
                              {section.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {section.blocks.length === 0 ? (
                        <div className="border border-dashed border-rule rounded-card py-6 flex items-center justify-center">
                          <p className="label-meta text-navy/25">Empty section</p>
                        </div>
                      ) : (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={section.blocks.map((b) => b.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="flex flex-col gap-2">
                              {section.blocks.map((block) => (
                                <FieldCard
                                  key={block.id}
                                  block={block}
                                  isSelected={selectedBlockId === block.id}
                                  onSelect={() => handleSelectBlock(block.id, section.id)}
                                  onDuplicate={() => {
                                    if (formId) duplicateBlock(formId, section.id, block.id);
                                  }}
                                  onDelete={() => {
                                    if (formId) removeBlock(formId, section.id, block.id);
                                    if (selectedBlockId === block.id) handleClosePanel();
                                  }}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "preview" && (
            <div className="flex-1 overflow-y-auto border-l border-[rgba(73,136,196,0.1)] bg-[#fafcff]">
              <FormEmbed form={form} preview />
            </div>
          )}

          {tab === "responses" && (
            <div className="flex-1 overflow-hidden">
              <ResponseTable
                form={form}
                responses={responses}
                onDelete={deleteResponse}
                onClear={() => clearResponses(form.id)}
              />
            </div>
          )}

          {tab === "share" && (
            <div className="flex-1 overflow-y-auto p-10">
              <SharePanel formId={form.id} />
            </div>
          )}
        </div>

        {/* Right panel */}
        {(() => {
          const currentBlock = selectedBlock ?? selectedBlockFromAll;
          return rightPanel === "block" && currentBlock ? (
            <aside className="w-72 border-l border-[rgba(73,136,196,0.12)] overflow-hidden flex flex-col shrink-0 bg-white">
              <FieldSettingsPanel
                block={currentBlock}
                allBlocks={allBlocksInForm}
                onChange={handleUpdateBlock}
                onClose={handleClosePanel}
              />
            </aside>
          ) : null;
        })()}

        {rightPanel === "form" && (
          <aside className="w-72 border-l border-[rgba(73,136,196,0.12)] overflow-hidden flex flex-col shrink-0 bg-white">
            <FormSettingsPanel
              form={form}
              onChange={(updates) => updateForm(form.id, updates)}
              onClose={() => setRightPanel(null)}
            />
          </aside>
        )}

        {rightPanel === "branding" && (
          <aside className="w-72 border-l border-[rgba(73,136,196,0.12)] overflow-hidden flex flex-col shrink-0 bg-white">
            <FormBrandingPanel
              form={form}
              onChange={(updates) => updateForm(form.id, updates)}
              onClose={() => setRightPanel(null)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

function SharePanel({ formId }: { formId: string }) {
  const publicUrl = `${window.location.origin}/form/${formId}`;
  const embedCode = `<iframe src="${window.location.origin}/embed/${formId}" width="100%" height="600" frameborder="0"></iframe>`;
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-medium text-navy tracking-tight mb-1">Share</h2>
        <p className="text-sm text-navy/50 font-light">
          Distribute this form via a public link or embed it on any website.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="label-meta">Public link</p>
        <div className="flex items-center gap-2 p-3 rounded-input border border-rule bg-sky/10">
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-sm text-blue font-mono truncate hover:underline"
          >
            {publicUrl}
          </a>
          <button
            type="button"
            onClick={() => copy(publicUrl, "link")}
            className="shrink-0 text-xs label-meta text-mid hover:text-navy transition-colors"
          >
            {copied === "link" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="label-meta">Embed code</p>
        <div className="flex flex-col gap-2 p-3 rounded-input border border-rule bg-sky/10">
          <pre className="text-[11px] font-mono text-navy/70 whitespace-pre-wrap break-all leading-relaxed">
            {embedCode}
          </pre>
          <button
            type="button"
            onClick={() => copy(embedCode, "embed")}
            className="self-start text-xs label-meta text-mid hover:text-navy transition-colors"
          >
            {copied === "embed" ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

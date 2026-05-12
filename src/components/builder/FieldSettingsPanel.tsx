import { X, Plus } from "lucide-react";
import type {
  Condition,
  ConditionOperator,
  FormBlock,
  FieldDefinition,
  BannerBlock,
  ExplainerBlock,
  RatingBlock,
  RatingStyle,
} from "../../types/form";
import {
  isFieldBlock,
  isBannerBlock,
  isExplainerBlock,
  isRatingBlock,
  isDataBlock,
} from "../../types/form";
import { Input, Textarea } from "../ui/Input";
import { Toggle } from "../ui/Toggle";
import { Button } from "../ui/Button";

interface FieldSettingsPanelProps {
  block: FormBlock;
  allBlocks: FormBlock[];
  onChange: (updates: Partial<FormBlock>) => void;
  onClose: () => void;
}

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

const RATING_STYLES: { value: RatingStyle; label: string }[] = [
  { value: "stars", label: "Stars" },
  { value: "numbers", label: "Numbers" },
  { value: "emoji", label: "Emoji" },
  { value: "nps", label: "NPS (0–10)" },
];

const EXPLAINER_STYLES: { value: ExplainerBlock["style"]; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "callout", label: "Callout" },
  { value: "muted", label: "Muted" },
];

const BANNER_HEIGHTS: { value: BannerBlock["height"]; label: string }[] = [
  { value: "sm", label: "Small (160px)" },
  { value: "md", label: "Medium (240px)" },
  { value: "lg", label: "Large (320px)" },
];

function ConditionRow({
  condition,
  referenceBlocks,
  onChange,
  onRemove,
}: {
  condition: Condition;
  referenceBlocks: FormBlock[];
  onChange: (c: Condition) => void;
  onRemove: () => void;
}) {
  const needsValue = !["is_empty", "is_not_empty"].includes(condition.if.operator);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-input border border-[rgba(73,136,196,0.15)] bg-sky/20">
      <div className="flex items-center gap-2">
        <span className="text-[11px] label-meta">If</span>
        <select
          value={condition.if.fieldId}
          onChange={(e) =>
            onChange({ ...condition, if: { ...condition.if, fieldId: e.target.value } })
          }
          className="flex-1 text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
        >
          <option value="">Select field</option>
          {referenceBlocks.map((b) => {
            const label = isFieldBlock(b) ? b.label : isRatingBlock(b) ? b.label : b.id;
            return (
              <option key={b.id} value={b.id}>
                {label}
              </option>
            );
          })}
        </select>
        <button type="button" onClick={onRemove} className="text-mid hover:text-navy shrink-0">
          <X size={13} />
        </button>
      </div>
      <select
        value={condition.if.operator}
        onChange={(e) =>
          onChange({
            ...condition,
            if: { ...condition.if, operator: e.target.value as ConditionOperator },
          })
        }
        className="text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>
      {needsValue && (
        <input
          type="text"
          value={String(condition.if.value ?? "")}
          onChange={(e) =>
            onChange({ ...condition, if: { ...condition.if, value: e.target.value } })
          }
          placeholder="Value"
          className="text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
        />
      )}
      <div className="flex items-center gap-2">
        <span className="text-[11px] label-meta">Then</span>
        <select
          value={condition.action}
          onChange={(e) => onChange({ ...condition, action: e.target.value as "show" | "hide" })}
          className="text-[12px] border border-[rgba(73,136,196,0.25)] rounded-tag px-2 py-1 bg-white text-navy"
        >
          <option value="show">Show this block</option>
          <option value="hide">Hide this block</option>
        </select>
      </div>
    </div>
  );
}

function ConditionsSection({
  conditions,
  referenceBlocks,
  onAdd,
  onUpdate,
  onRemove,
}: {
  conditions: Condition[];
  referenceBlocks: FormBlock[];
  onAdd: () => void;
  onUpdate: (i: number, c: Condition) => void;
  onRemove: (i: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-[rgba(73,136,196,0.15)]">
      <p className="label-meta">Conditional logic</p>
      {conditions.map((c, i) => (
        <ConditionRow
          key={i}
          condition={c}
          referenceBlocks={referenceBlocks}
          onChange={(updated) => onUpdate(i, updated)}
          onRemove={() => onRemove(i)}
        />
      ))}
      {referenceBlocks.length > 0 ? (
        <Button size="sm" variant="ghost" onClick={onAdd} className="self-start">
          <Plus size={13} />
          Add condition
        </Button>
      ) : (
        <p className="text-[11px] text-mid/70">Add more blocks to create conditions.</p>
      )}
    </div>
  );
}

function BannerSettings({
  block,
  onChange,
}: {
  block: BannerBlock;
  onChange: (updates: Partial<BannerBlock>) => void;
}) {
  return (
    <>
      <Input
        label="Image URL"
        value={block.imageUrl}
        placeholder="https://example.com/image.jpg"
        onChange={(e) => onChange({ imageUrl: e.target.value })}
      />

      <div className="flex flex-col gap-1">
        <p className="label-meta">Height</p>
        <select
          value={block.height}
          onChange={(e) => onChange({ height: e.target.value as BannerBlock["height"] })}
          className="text-sm border border-[rgba(73,136,196,0.25)] rounded-input px-2 py-1.5 bg-white text-navy"
        >
          {BANNER_HEIGHTS.map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <p className="label-meta">Object fit</p>
        <div className="flex gap-2">
          {(["cover", "contain"] as const).map((fit) => (
            <button
              key={fit}
              type="button"
              onClick={() => onChange({ objectFit: fit })}
              className={[
                "flex-1 py-1.5 text-sm rounded-input border transition-colors",
                block.objectFit === fit
                  ? "border-blue bg-blue/8 text-navy font-normal"
                  : "border-rule text-mid hover:border-mid/40",
              ].join(" ")}
            >
              {fit.charAt(0).toUpperCase() + fit.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Alt text"
        value={block.altText}
        placeholder="Describe the image"
        hint="Used for screen readers and accessibility."
        onChange={(e) => onChange({ altText: e.target.value })}
      />
    </>
  );
}

function ExplainerSettings({
  block,
  onChange,
}: {
  block: ExplainerBlock;
  onChange: (updates: Partial<ExplainerBlock>) => void;
}) {
  return (
    <>
      <Input
        label="Heading (optional)"
        value={block.heading ?? ""}
        placeholder="Bold heading text"
        onChange={(e) => onChange({ heading: e.target.value || undefined })}
      />

      <Textarea
        label="Body"
        value={block.body}
        rows={4}
        placeholder="Explanation text..."
        onChange={(e) => onChange({ body: e.target.value })}
      />

      <div className="flex flex-col gap-1">
        <p className="label-meta">Style</p>
        <div className="flex gap-2">
          {EXPLAINER_STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange({ style: s.value })}
              className={[
                "flex-1 py-1.5 text-sm rounded-input border transition-colors",
                block.style === s.value
                  ? "border-blue bg-blue/8 text-navy font-normal"
                  : "border-rule text-mid hover:border-mid/40",
              ].join(" ")}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function RatingSettings({
  block,
  allBlocks,
  onChange,
}: {
  block: RatingBlock;
  allBlocks: FormBlock[];
  onChange: (updates: Partial<RatingBlock>) => void;
}) {
  const referenceBlocks = allBlocks.filter((b) => b.id !== block.id && isDataBlock(b));
  const conditions = block.conditions ?? [];

  function addCondition() {
    const c: Condition = {
      if: { fieldId: referenceBlocks[0]?.id ?? "", operator: "equals", value: "" },
      action: "show",
    };
    onChange({ conditions: [...conditions, c] });
  }

  function updateCondition(i: number, c: Condition) {
    const next = [...conditions];
    next[i] = c;
    onChange({ conditions: next });
  }

  function removeCondition(i: number) {
    onChange({ conditions: conditions.filter((_, idx) => idx !== i) });
  }

  return (
    <>
      <Input
        label="Label"
        value={block.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />

      <Toggle
        checked={block.required}
        onChange={(v) => onChange({ required: v })}
        label="Required"
      />

      <div className="flex flex-col gap-1">
        <p className="label-meta">Rating style</p>
        <select
          value={block.ratingStyle}
          onChange={(e) => onChange({ ratingStyle: e.target.value as RatingStyle })}
          className="text-sm border border-[rgba(73,136,196,0.25)] rounded-input px-2 py-1.5 bg-white text-navy"
        >
          {RATING_STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {block.ratingStyle !== "nps" && (
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="Min"
              value={String(block.min)}
              onChange={(e) => onChange({ min: Number(e.target.value) || 1 })}
            />
          </div>
          <div className="flex-1">
            <Input
              label="Max"
              value={String(block.max)}
              onChange={(e) => onChange({ max: Number(e.target.value) || 5 })}
            />
          </div>
        </div>
      )}

      <Input
        label="Min label (optional)"
        value={block.minLabel ?? ""}
        placeholder="Not at all"
        onChange={(e) => onChange({ minLabel: e.target.value || undefined })}
      />

      <Input
        label="Max label (optional)"
        value={block.maxLabel ?? ""}
        placeholder="Absolutely"
        onChange={(e) => onChange({ maxLabel: e.target.value || undefined })}
      />

      <ConditionsSection
        conditions={conditions}
        referenceBlocks={referenceBlocks}
        onAdd={addCondition}
        onUpdate={updateCondition}
        onRemove={removeCondition}
      />
    </>
  );
}

function FieldSettings({
  block,
  allBlocks,
  onChange,
}: {
  block: FieldDefinition;
  allBlocks: FormBlock[];
  onChange: (updates: Partial<FieldDefinition>) => void;
}) {
  const isLayout = block.type === "section_divider" || block.type === "statement";
  const isSelect = block.type === "single_select" || block.type === "multi_select";
  const referenceBlocks = allBlocks.filter((b) => b.id !== block.id && isDataBlock(b));
  const conditions = block.conditions ?? [];

  function addOption() {
    const options = [...(block.options ?? []), `Option ${(block.options?.length ?? 0) + 1}`];
    onChange({ options });
  }

  function updateOption(i: number, value: string) {
    const options = [...(block.options ?? [])];
    options[i] = value;
    onChange({ options });
  }

  function removeOption(i: number) {
    const options = (block.options ?? []).filter((_, idx) => idx !== i);
    onChange({ options });
  }

  function addCondition() {
    const c: Condition = {
      if: { fieldId: referenceBlocks[0]?.id ?? "", operator: "equals", value: "" },
      action: "show",
    };
    onChange({ conditions: [...conditions, c] });
  }

  function updateCondition(i: number, c: Condition) {
    const next = [...conditions];
    next[i] = c;
    onChange({ conditions: next });
  }

  function removeCondition(i: number) {
    onChange({ conditions: conditions.filter((_, idx) => idx !== i) });
  }

  return (
    <>
      <Input
        label="Label"
        value={block.label}
        onChange={(e) => onChange({ label: e.target.value })}
      />

      {block.type === "statement" && (
        <Textarea
          label="Content"
          value={block.content ?? ""}
          rows={4}
          onChange={(e) => onChange({ content: e.target.value })}
        />
      )}

      {block.type === "section_divider" && (
        <Input
          label="Title (optional)"
          value={block.content ?? ""}
          placeholder="Section title"
          onChange={(e) => onChange({ content: e.target.value })}
        />
      )}

      {!isLayout && (
        <>
          <Input
            label="Placeholder"
            value={block.placeholder ?? ""}
            onChange={(e) => onChange({ placeholder: e.target.value })}
          />

          <Input
            label="Help text"
            value={block.helpText ?? ""}
            onChange={(e) => onChange({ helpText: e.target.value })}
          />

          <Toggle
            checked={block.required ?? false}
            onChange={(v) => onChange({ required: v })}
            label="Required"
          />
        </>
      )}

      {block.type === "file_upload" && (
        <Input
          label="Accepted file types"
          value={block.acceptTypes ?? ""}
          placeholder=".pdf,.docx,image/*"
          hint="Comma-separated MIME types or extensions"
          onChange={(e) => onChange({ acceptTypes: e.target.value })}
        />
      )}

      {isSelect && (
        <div className="flex flex-col gap-2">
          <p className="label-meta">Options</p>
          {(block.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className="flex-1 rounded-input border border-[rgba(73,136,196,0.25)] px-2 py-1.5 text-sm text-navy bg-white"
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="text-mid hover:text-navy shrink-0"
              >
                <X size={13} />
              </button>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={addOption} className="self-start">
            <Plus size={13} />
            Add option
          </Button>
        </div>
      )}

      <ConditionsSection
        conditions={conditions}
        referenceBlocks={referenceBlocks}
        onAdd={addCondition}
        onUpdate={updateCondition}
        onRemove={removeCondition}
      />
    </>
  );
}

export function FieldSettingsPanel({
  block,
  allBlocks,
  onChange,
  onClose,
}: FieldSettingsPanelProps) {
  const title = isBannerBlock(block)
    ? "Banner settings"
    : isExplainerBlock(block)
      ? "Explainer settings"
      : isRatingBlock(block)
        ? "Rating settings"
        : "Field settings";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(73,136,196,0.15)]">
        <p className="label-meta">{title}</p>
        <button type="button" onClick={onClose} className="text-mid hover:text-navy">
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {isBannerBlock(block) && (
          <BannerSettings block={block} onChange={(u) => onChange(u as Partial<FormBlock>)} />
        )}

        {isExplainerBlock(block) && (
          <ExplainerSettings block={block} onChange={(u) => onChange(u as Partial<FormBlock>)} />
        )}

        {isRatingBlock(block) && (
          <RatingSettings
            block={block}
            allBlocks={allBlocks}
            onChange={(u) => onChange(u as Partial<FormBlock>)}
          />
        )}

        {isFieldBlock(block) && (
          <FieldSettings
            block={block}
            allBlocks={allBlocks}
            onChange={(u) => onChange(u as Partial<FormBlock>)}
          />
        )}
      </div>
    </div>
  );
}

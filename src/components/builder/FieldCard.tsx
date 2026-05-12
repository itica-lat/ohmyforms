import { GripVertical, Copy, Trash2, Settings, Image, Star } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormBlock } from "../../types/form";
import {
  FIELD_TYPE_META,
  isFieldBlock,
  isBannerBlock,
  isExplainerBlock,
  isRatingBlock,
} from "../../types/form";

interface FieldCardProps {
  block: FormBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const RATING_STYLE_LABELS = {
  stars: "★ Stars",
  numbers: "# Numbers",
  emoji: "☺ Emoji",
  nps: "NPS",
};

const BANNER_HEIGHT_LABELS = {
  sm: "160px",
  md: "240px",
  lg: "320px",
};

export function FieldCard({ block, isSelected, onSelect, onDuplicate, onDelete }: FieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const cardClass = [
    "group flex items-start gap-3 px-3 py-3 rounded-card border transition-colors animate-block-in",
    isSelected
      ? "border-blue bg-blue/5"
      : "border-[rgba(73,136,196,0.15)] hover:border-[rgba(73,136,196,0.3)]",
  ].join(" ");

  const dragHandle = (
    <button
      type="button"
      {...attributes}
      {...listeners}
      className="text-mid/40 hover:text-mid cursor-grab active:cursor-grabbing mt-0.5 shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <GripVertical size={14} />
    </button>
  );

  const actions = <FieldActions onEdit={onSelect} onDuplicate={onDuplicate} onDelete={onDelete} />;

  if (isFieldBlock(block) && block.type === "section_divider") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={[
          "group flex items-center gap-3 px-3 py-2 rounded-card border transition-colors animate-block-in",
          isSelected
            ? "border-blue bg-blue/5"
            : "border-[rgba(73,136,196,0.15)] hover:border-[rgba(73,136,196,0.3)]",
        ].join(" ")}
        onClick={onSelect}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-mid/40 hover:text-mid cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 flex items-center gap-3">
          <div className="h-px flex-1 bg-rule" />
          <span className="label-meta text-navy/50 shrink-0">
            {block.content || "Section divider"}
          </span>
          <div className="h-px flex-1 bg-rule" />
        </div>
        {actions}
      </div>
    );
  }

  if (isBannerBlock(block)) {
    return (
      <div ref={setNodeRef} style={style} className={cardClass} onClick={onSelect}>
        {dragHandle}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="w-8 h-8 rounded-input border border-rule bg-sky/20 flex items-center justify-center shrink-0 overflow-hidden">
            {block.imageUrl ? (
              <img src={block.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Image size={14} className="text-mid/50" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-sm font-normal text-navy">Banner image</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="label-meta text-navy/40">{BANNER_HEIGHT_LABELS[block.height]}</span>
              <span className="label-meta text-navy/20">·</span>
              <span className="label-meta text-navy/40">{block.objectFit}</span>
            </div>
          </div>
        </div>
        {actions}
      </div>
    );
  }

  if (isExplainerBlock(block)) {
    return (
      <div ref={setNodeRef} style={style} className={cardClass} onClick={onSelect}>
        {dragHandle}
        <div className="flex-1 min-w-0">
          {block.heading && (
            <p className="text-sm font-normal text-navy truncate">{block.heading}</p>
          )}
          <p className="text-[12px] text-navy/55 font-light truncate leading-relaxed">
            {block.body}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="label-meta text-navy/40">Explainer</span>
            <span className="label-meta text-navy/20">·</span>
            <span className="label-meta text-navy/40">{block.style}</span>
          </div>
        </div>
        {actions}
      </div>
    );
  }

  if (isRatingBlock(block)) {
    return (
      <div ref={setNodeRef} style={style} className={cardClass} onClick={onSelect}>
        {dragHandle}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-normal text-navy truncate">{block.label}</span>
            {block.required && <span className="text-red-400 text-xs leading-none">*</span>}
          </div>
          <div className="flex items-center gap-2">
            <Star size={10} className="text-mid/50" />
            <span className="label-meta text-navy/40">
              {RATING_STYLE_LABELS[block.ratingStyle]}
            </span>
            <span className="label-meta text-navy/20">·</span>
            <span className="label-meta text-navy/40">
              {block.min}–{block.max}
            </span>
            {block.conditions && block.conditions.length > 0 && (
              <span className="label-meta text-mid/60">· conditional</span>
            )}
          </div>
        </div>
        {actions}
      </div>
    );
  }

  if (isFieldBlock(block)) {
    const meta = FIELD_TYPE_META[block.type];
    return (
      <div ref={setNodeRef} style={style} className={cardClass} onClick={onSelect}>
        {dragHandle}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-normal text-navy truncate">{block.label}</span>
            {block.required && <span className="text-red-400 text-xs leading-none">*</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="label-meta text-navy/40">{meta.label}</span>
            {block.conditions && block.conditions.length > 0 && (
              <span className="label-meta text-mid/60">· conditional</span>
            )}
          </div>
        </div>
        {actions}
      </div>
    );
  }

  return null;
}

function FieldActions({
  onEdit,
  onDuplicate,
  onDelete,
}: {
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onEdit}
        className="p-1.5 rounded-tag text-mid hover:text-navy hover:bg-sky/50 transition-colors"
      >
        <Settings size={13} />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        className="p-1.5 rounded-tag text-mid hover:text-navy hover:bg-sky/50 transition-colors"
      >
        <Copy size={13} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="p-1.5 rounded-tag text-mid hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

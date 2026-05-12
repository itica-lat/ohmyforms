import {
  AlignLeft,
  AlignJustify,
  AtSign,
  Hash,
  Calendar,
  Clock,
  ChevronDown,
  CheckSquare,
  Upload,
  PenLine,
  Minus,
  FileText,
  Image,
  MessageSquare,
  Star,
  Plus,
} from "lucide-react";
import type { FieldType } from "../../types/form";
import type { AddableBlockType } from "../../store/formStore";

interface FieldTypePickerProps {
  onAdd: (type: AddableBlockType) => void;
}

const BLOCK_ICONS: Record<AddableBlockType, React.ReactNode> = {
  short_text: <AlignLeft size={14} />,
  long_text: <AlignJustify size={14} />,
  email: <AtSign size={14} />,
  number: <Hash size={14} />,
  date: <Calendar size={14} />,
  datetime: <Clock size={14} />,
  single_select: <ChevronDown size={14} />,
  multi_select: <CheckSquare size={14} />,
  file_upload: <Upload size={14} />,
  signature: <PenLine size={14} />,
  section_divider: <Minus size={14} />,
  statement: <FileText size={14} />,
  banner: <Image size={14} />,
  explainer: <MessageSquare size={14} />,
  rating: <Star size={14} />,
};

const BLOCK_LABELS: Record<AddableBlockType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  email: "Email",
  number: "Number",
  date: "Date",
  datetime: "Date & time",
  single_select: "Single select",
  multi_select: "Multi select",
  file_upload: "File upload",
  signature: "Signature",
  section_divider: "Section divider",
  statement: "Statement",
  banner: "Banner image",
  explainer: "Explainer",
  rating: "Rating",
};

const CATEGORIES: { label: string; types: AddableBlockType[] }[] = [
  { label: "Text", types: ["short_text", "long_text", "email", "number"] },
  { label: "Date & Time", types: ["date", "datetime"] },
  { label: "Choice", types: ["single_select", "multi_select"] },
  { label: "Rating", types: ["rating"] },
  { label: "Media", types: ["file_upload", "signature"] },
  {
    label: "Layout",
    types: ["banner", "explainer", "section_divider", "statement"],
  },
];

export function FieldTypePicker({ onAdd }: FieldTypePickerProps) {
  return (
    <div className="flex flex-col gap-5 py-4">
      {CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <p className="label-meta px-4 mb-2">{cat.label}</p>
          <div className="flex flex-col gap-0.5 px-2">
            {cat.types.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onAdd(type)}
                className="group flex items-center gap-2.5 px-3 py-2 rounded-input text-sm text-navy/70 hover:bg-sky/50 hover:text-navy transition-colors text-left w-full"
              >
                <span className="text-mid shrink-0 group-hover:text-blue transition-colors">
                  {BLOCK_ICONS[type]}
                </span>
                <span className="font-light flex-1">{BLOCK_LABELS[type]}</span>
                <span className="opacity-0 group-hover:opacity-100 text-mid transition-opacity shrink-0">
                  <Plus size={11} />
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Re-export for components still using the old FieldType signature
export type { FieldType };

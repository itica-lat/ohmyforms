export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "number"
  | "date"
  | "datetime"
  | "single_select"
  | "multi_select"
  | "file_upload"
  | "signature"
  | "section_divider"
  | "statement";

export type ConditionOperator = "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";

export interface Condition {
  if: {
    fieldId: string;
    operator: ConditionOperator;
    value: unknown;
  };
  action: "show" | "hide";
}

export interface FieldDefinition {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  conditions?: Condition[];
  options?: string[];
  acceptTypes?: string;
  content?: string;
}

export interface BannerBlock {
  id: string;
  type: "banner";
  imageUrl: string;
  height: "sm" | "md" | "lg";
  objectFit: "cover" | "contain";
  altText: string;
}

export interface ExplainerBlock {
  id: string;
  type: "explainer";
  heading?: string;
  body: string;
  style: "default" | "callout" | "muted";
}

export type RatingStyle = "stars" | "numbers" | "emoji" | "nps";

export interface RatingBlock {
  id: string;
  type: "rating";
  label: string;
  required: boolean;
  ratingStyle: RatingStyle;
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  conditions?: Condition[];
}

export type FormBlock = FieldDefinition | BannerBlock | ExplainerBlock | RatingBlock;

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  blocks: FormBlock[];
}

export type BrandingFont =
  | "DM Sans"
  | "DM Mono"
  | "DM Serif Display"
  | "Inter"
  | "Roboto Mono"
  | "Playfair Display";

export interface FormBranding {
  primaryColor: string;
  fontFamily: BrandingFont;
  logoUrl?: string;
  titleStyle: "default" | "display" | "mono";
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  submitLabel: string;
  successMessage?: string;
  redirectUrl?: string;
  accentColor: string;
  branding?: FormBranding;
  sections: FormSection[];
  createdAt: string;
  updatedAt: string;
}

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: string;
  data: Record<string, unknown>;
}

export const FIELD_TYPE_META: Record<
  FieldType,
  { label: string; category: string; hasValue: boolean }
> = {
  short_text: { label: "Short text", category: "Text", hasValue: true },
  long_text: { label: "Long text", category: "Text", hasValue: true },
  email: { label: "Email", category: "Text", hasValue: true },
  number: { label: "Number", category: "Text", hasValue: true },
  date: { label: "Date", category: "Date & Time", hasValue: true },
  datetime: { label: "Date & time", category: "Date & Time", hasValue: true },
  single_select: { label: "Single select", category: "Choice", hasValue: true },
  multi_select: { label: "Multi select", category: "Choice", hasValue: true },
  file_upload: { label: "File upload", category: "Media", hasValue: true },
  signature: { label: "Signature", category: "Media", hasValue: true },
  section_divider: { label: "Section divider", category: "Layout", hasValue: false },
  statement: { label: "Statement", category: "Layout", hasValue: false },
};

export function isFieldBlock(block: FormBlock): block is FieldDefinition {
  const fieldTypes: string[] = [
    "short_text",
    "long_text",
    "email",
    "number",
    "date",
    "datetime",
    "single_select",
    "multi_select",
    "file_upload",
    "signature",
    "section_divider",
    "statement",
  ];
  return fieldTypes.includes(block.type);
}

export function isBannerBlock(block: FormBlock): block is BannerBlock {
  return block.type === "banner";
}

export function isExplainerBlock(block: FormBlock): block is ExplainerBlock {
  return block.type === "explainer";
}

export function isRatingBlock(block: FormBlock): block is RatingBlock {
  return block.type === "rating";
}

export function isDataBlock(block: FormBlock): boolean {
  if (block.type === "banner" || block.type === "explainer") return false;
  if (block.type === "section_divider" || block.type === "statement") return false;
  return true;
}

export function getAllBlocks(form: FormSchema): FormBlock[] {
  return form.sections.flatMap((s) => s.blocks);
}

export function getDataBlocks(form: FormSchema): (FieldDefinition | RatingBlock)[] {
  return getAllBlocks(form).filter(isDataBlock) as (FieldDefinition | RatingBlock)[];
}

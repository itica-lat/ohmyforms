import type { Condition, ConditionOperator, FormBlock } from "../types/form";

function evaluate(
  operator: ConditionOperator,
  fieldValue: unknown,
  conditionValue: unknown,
): boolean {
  const strValue = fieldValue == null ? "" : String(fieldValue);
  const strCondition = conditionValue == null ? "" : String(conditionValue);

  switch (operator) {
    case "equals":
      return strValue === strCondition;
    case "not_equals":
      return strValue !== strCondition;
    case "contains":
      return strValue.toLowerCase().includes(strCondition.toLowerCase());
    case "is_empty":
      return strValue.trim() === "" || fieldValue == null;
    case "is_not_empty":
      return strValue.trim() !== "" && fieldValue != null;
    default:
      return true;
  }
}

function getBlockConditions(block: FormBlock): Condition[] | undefined {
  if (block.type === "banner" || block.type === "explainer") return undefined;
  return block.conditions;
}

export function isBlockVisible(block: FormBlock, values: Record<string, unknown>): boolean {
  const conditions = getBlockConditions(block);
  if (!conditions || conditions.length === 0) return true;

  for (const condition of conditions) {
    const fieldValue = values[condition.if.fieldId];
    const passes = evaluate(condition.if.operator, fieldValue, condition.if.value);

    if (passes && condition.action === "hide") return false;
    if (passes && condition.action === "show") return true;
  }

  const hasShowConditions = conditions.some((c) => c.action === "show");
  if (hasShowConditions) return false;

  return true;
}

export function isFieldVisible(block: FormBlock, values: Record<string, unknown>): boolean {
  return isBlockVisible(block, values);
}

export function getVisibleBlocks(
  blocks: FormBlock[],
  values: Record<string, unknown>,
): FormBlock[] {
  return blocks.filter((b) => isBlockVisible(b, values));
}

export function getVisibleFields(
  blocks: FormBlock[],
  values: Record<string, unknown>,
): FormBlock[] {
  return getVisibleBlocks(blocks, values);
}

export function evaluateConditions(
  conditions: Condition[],
  values: Record<string, unknown>,
): boolean {
  if (!conditions || conditions.length === 0) return true;
  const condition = conditions[0];
  if (!condition) return true;
  const fieldValue = values[condition.if.fieldId];
  return evaluate(condition.if.operator, fieldValue, condition.if.value);
}

import type { Condition, ConditionOperator, FieldDefinition } from '../types/form'

function evaluate(
  operator: ConditionOperator,
  fieldValue: unknown,
  conditionValue: unknown,
): boolean {
  const strValue = fieldValue == null ? '' : String(fieldValue)
  const strCondition = conditionValue == null ? '' : String(conditionValue)

  switch (operator) {
    case 'equals':
      return strValue === strCondition
    case 'not_equals':
      return strValue !== strCondition
    case 'contains':
      return strValue.toLowerCase().includes(strCondition.toLowerCase())
    case 'is_empty':
      return strValue.trim() === '' || fieldValue == null
    case 'is_not_empty':
      return strValue.trim() !== '' && fieldValue != null
    default:
      return true
  }
}

export function isFieldVisible(
  field: FieldDefinition,
  values: Record<string, unknown>,
): boolean {
  if (!field.conditions || field.conditions.length === 0) return true

  for (const condition of field.conditions) {
    const fieldValue = values[condition.if.fieldId]
    const passes = evaluate(condition.if.operator, fieldValue, condition.if.value)

    if (passes && condition.action === 'hide') return false
    if (passes && condition.action === 'show') return true
  }

  // If all conditions have action 'show' and none passed, hide the field
  const hasShowConditions = field.conditions.some((c) => c.action === 'show')
  if (hasShowConditions) return false

  return true
}

export function getVisibleFields(
  fields: FieldDefinition[],
  values: Record<string, unknown>,
): FieldDefinition[] {
  return fields.filter((f) => isFieldVisible(f, values))
}

export function evaluateConditions(
  conditions: Condition[],
  values: Record<string, unknown>,
): boolean {
  if (!conditions || conditions.length === 0) return true
  // Use the first condition as the primary rule
  const condition = conditions[0]
  if (!condition) return true
  const fieldValue = values[condition.if.fieldId]
  return evaluate(condition.if.operator, fieldValue, condition.if.value)
}

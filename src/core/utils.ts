import { type CallExpression, SyntaxKind } from 'typescript'

function toCamelcase(text: string): string {
  return text.split(/(?=[A-Z])|[\s_\-]+/).map((word, index) =>
    index === 0
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  ).join('')
}

/**
 * Determines if a given CallExpression represents an object creation.
 *
 * This function checks if the call expression corresponds to property access
 * with the name 'object', indicating the use of an 'object' expression.
 *
 * @param callExpression - The CallExpression to evaluate.
 * @returns True if the CallExpression is an object expression; otherwise, false.
 */
function isObjectExpression(callExpression: CallExpression): boolean {
  const kind = callExpression.expression.kind
  const text = (callExpression.expression as any)?.name?.text
  return kind === SyntaxKind.PropertyAccessExpression && text === 'object'
}

/**
 * Checks if a description contains an doc extended notation.
 * The extended notation is recognized if it contains 'zod:' followed by the schema definition.
 *
 * @param description - The description string to check.
 * @returns True if the description contains extended zod notation; otherwise, false.
 */
function isDocExtendedNotation(description: string | undefined): boolean {
  if (!description) {
    return false
  }
  return description.split('zod: ').length >= 2
}

/**
 * Extracts the Zod schema portion from a documentation's extended notation.
 * The extended notation is recognized if it contains 'zod:' followed by the schema definition.
 *
 * @param description - The description string containing the Zod extended notation.
 * @returns The extracted Zod schema as a string if available; otherwise, an empty string.
 *
 * @example
 * ```ts
 * const description = "This is an example description. zod: string().min(1)"
 * const extracted = extractZodSchemaFromDescription(description)
 * // -> "string().min(1)"
 * ```
 */
function extractZodSchemaFromDescription(description: string | undefined): string {
  if (!description) {
    return ''
  }
  const parts = description.split('zod: ')
  return parts.length < 2 ? '' : parts[1].trim()
}

/**
 * Removes the Zod schema from the description and returns the remaining string.
 *
 * @param description - The description string containing the Zod extended notation.
 * @returns The description without the Zod schema portion.
 *
 * @example
 * ```ts
 * const description = "This is an example description. zod: string().min(1)"
 * const result = removeZodSchemaFromDescription(description)
 * // -> "This is an example description."
 * ```
 */
function removeZodSchemaFromDescription(description: string | undefined): string {
  if (!description) {
    return ''
  }
  return description.split('zod: ')[0].trim()
}

export default {
  toCamelcase,
  isObjectExpression,
  isDocExtendedNotation,
  extractZodSchemaFromDescription,
  removeZodSchemaFromDescription,
}

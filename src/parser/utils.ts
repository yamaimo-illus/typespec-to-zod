import type {
  ComponentsObject,
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31'
import { isReferenceObject } from 'openapi3-ts/oas31'
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

/**
 * Checks if a schema object or any of its children contain a ReferenceObject.
 *
 * @param obj - The schema object to check for references.
 * @returns A boolean indicating if there is a reference object.
 */
function hasReferenceObject(obj: SchemaObject): boolean {
  const targets: Record<string, (SchemaObject | ReferenceObject)[]> = {
    allOf: obj.allOf ?? [],
    anyOf: obj.anyOf ?? [],
    oneOf: obj.oneOf ?? [],
    items: obj.items ? [obj.items] : [],
    properties: obj.properties ? [...Object.values(obj.properties)] : [],
    additionalProperties: obj.additionalProperties
      ? typeof obj.additionalProperties !== 'boolean' ? [obj.additionalProperties] : []
      : [],
    // TODO: check if `not` in SchemaObject is ReferenceObject
    // TODO: check if `propertyNames` in SchemaObject is ReferenceObject
  }

  for (const [_, values] of Object.entries(targets)) {
    for (const value of values) {
      if (isReferenceObject(value)) {
        return true
      }
    }
  }
  return false
}

/**
 * Converts a schema object or a reference object to a pure schema object,
 * resolving any references recursively.
 *
 * @param openApiObject - The full OpenAPI object containing all schemas.
 * @param obj - The schema or reference object to convert.
 * @returns The resolved schema object.
 * @throws If a schema referenced is not found or is itself a reference.
 */
function toPureSchemaObject(
  openApiObject: OpenAPIObject,
  obj: SchemaObject | ReferenceObject,
): SchemaObject {
  if (isReferenceObject(obj)) {
    const name = obj.$ref.split('/').pop() ?? ''
    const schema = openApiObject.components?.schemas?.[name]
    if (!schema) {
      throw new Error(`Schema for reference ${obj.$ref} not found.`)
    }
    if (isReferenceObject(schema)) {
      return toPureSchemaObject(openApiObject, schema)
    }
    else if (hasReferenceObject(schema)) {
      return toPureSchemaObject(openApiObject, schema)
    }
    else {
      return schema
    }
  }

  if (!hasReferenceObject(obj)) {
    return obj
  }

  const schema = obj
  schema.allOf = schema.allOf?.map(obj => toPureSchemaObject(openApiObject, obj))
  schema.anyOf = schema.anyOf?.map(obj => toPureSchemaObject(openApiObject, obj))
  schema.oneOf = schema.oneOf?.map(obj => toPureSchemaObject(openApiObject, obj))
  schema.items = schema.items ? toPureSchemaObject(openApiObject, schema.items) : undefined
  schema.additionalProperties
    = schema.additionalProperties && isReferenceObject(schema.additionalProperties)
      ? toPureSchemaObject(openApiObject, schema.additionalProperties)
      : undefined
  // TODO: convert schema.not into toPureSchemaObject()
  // TODO: convert schema.propertyNames into toPureSchemaObject()

  const newProperties = schema.properties ?? {}
  for (const name in schema.properties) {
    newProperties[name] = toPureSchemaObject(openApiObject, schema.properties[name])
  }
  schema.properties = newProperties

  return schema
}

export default {
  toCamelcase,
  isObjectExpression,
  isDocExtendedNotation,
  extractZodSchemaFromDescription,
  removeZodSchemaFromDescription,
  hasReferenceObject,
  toPureSchemaObject,
}

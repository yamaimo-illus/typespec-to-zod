import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31'
import type { CallExpression, Identifier, Node, PropertyAssignment } from 'typescript'
import consola from 'consola'
import { isReferenceObject } from 'openapi3-ts/oas31'
import { addSyntheticLeadingComment, factory, isCallExpression, NodeFlags, SyntaxKind } from 'typescript'
import { schemaPrefix } from '../constants'
import utils from '../utils'

/**
 * Adds a leading comment to a given TypeScript node.
 *
 * @param comment - The text of the comment to be added.
 * @param node - The TypeScript AST node to which the comment will be added.
 * @returns The node with the added comment.
 */
function addSingleLineComment<T extends Node>(comment: string | undefined, node: T) {
  if (!comment) {
    return node
  }
  // Ensure the comment does not include any newline characters that could break the syntax.
  const sanitizedComment = comment.replace(/\r?\n|\r/g, '')

  return addSyntheticLeadingComment(
    node,
    SyntaxKind.SingleLineCommentTrivia,
    ` ${sanitizedComment}`,
    true,
  )
}

/**
 * Adds a multiline comment to a given TypeScript node.
 *
 * @param comment - The text of the comment to be added.
 * @param node - The TypeScript AST node to which the comment will be added.
 * @returns The node with the added comment.
 */
function addMultiLineComment<T extends Node>(comment: string | undefined, node: T): T {
  if (!comment) {
    return node
  }
  // Ensure the comment does not include any characters that could disrupt the comment syntax.
  const sanitizedComment = comment.replace(/\*\//g, '*\\/')

  return addSyntheticLeadingComment(
    node,
    SyntaxKind.MultiLineCommentTrivia,
    ` ${sanitizedComment}`,
    true,
  )
}

/**
 * Creates an import declaration for the zod library.
 *
 * @returns A TypeScript import declaration for zod.
 *
 * @example
 * ```ts
 * import { z } from "zod"
 * ```
 */
function createZodImportDeclaration() {
  return factory.createImportDeclaration(
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(false, undefined, factory.createIdentifier('z')),
      ]),
    ),
    factory.createStringLiteral('zod'),
    undefined,
  )
}

/**
 * Represents the supported Zod types, including primitive types and other supported types.
 *
 * @see https://zod.dev/?id=primitives
 */
type ZodType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'date'
  | 'symbol'
  | 'undefined'
  | 'null'
  | 'void'
  | 'any'
  | 'unknown'
  | 'never'
  | 'array'
  | 'enum'
  | 'object'
  | 'union'
  | 'record'

/**
 * Creates a TypeScript property access expression for a specified zod type.
 *
 * @param type - The zod type as a string, which can be 'unknown', 'enum', 'union',
 * 'array', 'object', 'number', or any other valid zod type.
 * @returns A PropertyAccessExpression representing the zod type.
 *
 * @example
 * ```ts
 * createZodTypeExpression('string')
 * // z.string()
 *
 * createZodTypeExpression('array')
 * // z.array()
 * ```
 */
function createZodTypeExpression(type: ZodType) {
  return factory.createPropertyAccessExpression(
    factory.createIdentifier('z'),
    factory.createIdentifier(type),
  )
}

/**
 * Creates a zod expression based on a given OpenAPI schema object.
 *
 * @param obj - The schema object or reference object.
 * @param required - Indicates if the property is required (default is true).
 * @returns A CallExpression or Identifier representing the zod schema.
 *
 * @example
 * ```ts
 * z.string().email().default('user@example.com')
 * z.object({
 *   propA: z.string(),
 *   propB: z.number(),
 * })
 * ```
 */
function createZodExpression(
  obj: SchemaObject | ReferenceObject,
  required: boolean = true,
): CallExpression | Identifier {
  if (isReferenceObject(obj)) {
    const name = obj.$ref.split('/').pop() ?? ''
    return factory.createIdentifier(utils.toCamelcase(`${schemaPrefix}_${name}`))
  }

  const createBaseExpression = () => {
    // Enum type
    if (obj.enum) {
      return factory.createCallExpression(
        createZodTypeExpression('enum'),
        undefined,
        [factory.createArrayLiteralExpression(
          obj.enum.map(e => factory.createStringLiteral(String(e))),
          false,
        )],
      )
    }

    // TODO: Support record type
    // // Record type
    // if (obj.additionalProperties !== undefined) {
    //   const additionalProperties = typeof obj.additionalProperties === 'boolean'
    //     ? createZodTypeExpression('boolean')
    //     : createZodExpression(obj.additionalProperties)

    //   return factory.createCallExpression(
    //     createZodTypeExpression('record'),
    //     undefined,
    //     [
    //       factory.createCallExpression(
    //         createZodTypeExpression('string'),
    //         undefined,
    //         [],
    //       ),
    //       additionalProperties,
    //     ],
    //   )
    // }

    // Union type
    if (obj.anyOf || obj.oneOf) {
      const target = [...obj?.anyOf ?? [], ...obj?.oneOf ?? []]
      const unionTypes = target.map(obj => createZodExpression(obj))

      return factory.createCallExpression(
        createZodTypeExpression('union'),
        undefined,
        [factory.createArrayLiteralExpression(unionTypes, false)],
      )
    }
    // Extended notation for description
    if (utils.isDocExtendedNotation(obj.description)) {
      const schemaExpression = utils.extractZodSchemaFromDescription(obj.description)
      return factory.createIdentifier(schemaExpression)
    }

    switch (obj.type) {
      case 'array':
        return factory.createCallExpression(
          createZodTypeExpression('array'),
          undefined,
          [obj.items ? createZodExpression(obj.items) : createZodTypeExpression('unknown')],
        )
      case 'object':
      {
        const properties = obj.properties
          ? Object.entries(obj.properties).map(([name, child]) => {
            const required = obj.required?.includes(name) ?? false
            return createZodPropertyStatement(name, child, required)
          },
          )
          : []
        return factory.createCallExpression(
          createZodTypeExpression('object'),
          undefined,
          [factory.createObjectLiteralExpression(properties, true)],
        )
      }
      case 'integer':
      case 'number':
        return factory.createCallExpression(
          createZodTypeExpression('number'),
          undefined,
          [],
        )
      case 'boolean':
      case 'null':
      case 'string':
        return factory.createCallExpression(
          createZodTypeExpression(obj.type),
          undefined,
          [],
        )
      default:
        return factory.createCallExpression(
          createZodTypeExpression('unknown'),
          undefined,
          [],
        )
    }
  }

  let expression = createBaseExpression()
  if (isCallExpression(expression)) {
    expression = addMerge(obj, expression)
    expression = addFormat(obj, expression)
    expression = addConstraints(obj, expression)
    expression = addDefault(obj, expression)
    expression = addNullish(required, expression)
  }

  return expression
}

/**
 * Generates a zod property assignment for a given property name and schema.
 *
 * @param identifier - The name of the property.
 * @param obj - The schema object or reference.
 * @param required - If true, the property is required; otherwise, it's optional.
 * @returns A simplified PropertyAssignment for zod schema generation.
 *
 * @example
 * ```ts
 * a: z.string(),
 * b: z.number()
 * ```
 */
function createZodPropertyStatement(
  identifier: string,
  obj: SchemaObject | ReferenceObject,
  required: boolean = true,
): PropertyAssignment {
  const assignment = factory.createPropertyAssignment(
    factory.createIdentifier(identifier),
    createZodExpression(obj, required),
  )
  const description = utils.removeZodSchemaFromDescription(obj.description)

  return addSingleLineComment(description, assignment)
}

/**
 * Creates a variable statement exporting a zod schema.
 *
 * @param variableName - The name of the variable.
 * @param obj - The schema object or reference object.
 * @returns A variable statement declaring the zod schema.
 *
 * @example
 * ```ts
 * export const mySchema = z.object({
 *   a: z.string(),
 *   b: z.number(),
 * })
 * ```
 */
function createZodVariableStatement(variableName: string, obj: SchemaObject | ReferenceObject) {
  const statement = factory.createVariableStatement(
    [factory.createToken(SyntaxKind.ExportKeyword)],
    factory.createVariableDeclarationList(
      [factory.createVariableDeclaration(
        factory.createIdentifier(variableName),
        undefined,
        undefined,
        createZodExpression(obj),
      )],
      NodeFlags.Const,
    ),
  )
  const description = utils.removeZodSchemaFromDescription(obj.description)

  return addSingleLineComment(description, statement)
}

/**
 * Adds a format specification to a zod call expression.
 *
 * @param obj - The schema object or reference object.
 * @param callExpression - The existing call expression.
 * @returns A new CallExpression with the format applied.
 */
function addFormat(obj: SchemaObject, callExpression: CallExpression): CallExpression {
  const format = obj.format
  if (!format) {
    return callExpression
  }

  const formatMap: { [key: string]: string } = {
    'integer': 'int',
    'int64': 'int',
    'int32': 'int',
    'int16': 'int',
    'int8': 'int',
    'safeint': 'int',
    'uint64': 'int',
    'uint32': 'int',
    'uint16': 'int',
    'uint8': 'int',
    'date-time': 'datetime',
    'date': 'date',
    'time': 'time',
    'duration': 'duration',
    'ip': 'ip',
    'email': 'email',
    'uuid': 'uuid',
    'cuid': 'cuid',
    'cuid2': 'cuid2',
    'url': 'url',
    'uri': 'url',
  }

  const formatIdentifier = formatMap[format]
  if (!formatIdentifier) {
    consola.warn(`[Format] ${format} is not supported`)
    return callExpression
  }

  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      callExpression,
      factory.createIdentifier(formatIdentifier),
    ),
    undefined,
    [],
  )
}

/**
 * Adds a default value to a zod call expression.
 *
 * @param obj - The schema object or reference object.
 * @param callExpression - The existing call expression.
 * @returns A new CallExpression with the default value applied.
 */
function addDefault(obj: SchemaObject, callExpression: CallExpression): CallExpression {
  const defaultValue = obj.default
  if (defaultValue === undefined) {
    return callExpression
  }

  const toLiteral = (v: any) => {
    const type = typeof v
    switch (type) {
      case 'string':
        return factory.createStringLiteral(v)
      case 'number':
        return factory.createNumericLiteral(v)
      case 'bigint':
        return factory.createBigIntLiteral(v)
      case 'boolean':
        return v ? factory.createTrue() : factory.createFalse()
      default:
        return factory.createNull()
    }
  }

  const argumentNode = Array.isArray(defaultValue)
    ? factory.createArrayLiteralExpression(defaultValue.map(v => toLiteral(v)))
    : toLiteral(defaultValue)

  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      callExpression,
      factory.createIdentifier('default'),
    ),
    undefined,
    [argumentNode],
  )
}

/**
 * Marks a zod call expression as nullish.
 *
 * @param required - If false, adds a nullish modifier to the zod type.
 * @param callExpression - The current call expression.
 * @returns The modified CallExpression.
 */
function addNullish(required: boolean, callExpression: CallExpression): CallExpression {
  if (required) {
    return callExpression
  }

  return factory.createCallExpression(
    factory.createPropertyAccessExpression(
      callExpression,
      factory.createIdentifier('nullish'),
    ),
    undefined,
    [],
  )
}

/**
 * Adds constraints such as min, max, greater than, and less than to a zod call expression.
 *
 * @param obj - An object containing the constraint values.
 * @param callExpression - The existing call expression.
 * @returns A new CallExpression with the constraints applied.
 */
function addConstraints(obj: SchemaObject, callExpression: CallExpression): CallExpression {
  const constraints = [
    { prop: 'minItems', method: 'min' },
    { prop: 'maxItems', method: 'max' },
    { prop: 'minLength', method: 'min' },
    { prop: 'maxLength', method: 'max' },
    { prop: 'minimum', method: obj.exclusiveMinimum ? 'gt' : 'gte' },
    { prop: 'maximum', method: obj.exclusiveMaximum ? 'lt' : 'lte' },
  ]

  let currentExpression = callExpression
  for (const { prop, method } of constraints) {
    if ((obj as any)[prop] !== undefined) {
      currentExpression = factory.createCallExpression(
        factory.createPropertyAccessExpression(
          currentExpression,
          factory.createIdentifier(method),
        ),
        undefined,
        [factory.createNumericLiteral((obj as any)[prop])],
      )
    }
  }

  return currentExpression
}
function addMerge(obj: SchemaObject, callExpression: CallExpression): CallExpression {
  const allOf = obj.allOf
  if (!allOf?.length) {
    return callExpression
  }

  let mergedExpression: CallExpression | Identifier = callExpression
  for (const schema of allOf) {
    const schemaExpression = createZodExpression(schema)

    if (utils.isObjectExpression(callExpression)) {
      mergedExpression = factory.createCallExpression(
        factory.createPropertyAccessExpression(
          mergedExpression,
          factory.createIdentifier('merge'),
        ),
        undefined,
        [schemaExpression],
      )
    }
    else {
      mergedExpression = schemaExpression
    }
  }

  return mergedExpression as CallExpression
}

export default {
  addSingleLineComment,
  addMultiLineComment,
  createZodImportDeclaration,
  createZodTypeExpression,
  createZodExpression,
  createZodPropertyStatement,
  createZodVariableStatement,
  addFormat,
  addDefault,
  addNullish,
  addConstraints,
  addMerge,
}

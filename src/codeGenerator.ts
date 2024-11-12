import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas31'
import type { FileManager } from './fileManager.js'
import { EOL } from 'node:os'
import { isReferenceObject } from 'openapi3-ts/oas31'
import ts from 'typescript'
import { componentsComment, pathsComment, queriesComment } from './constants.js'
import ast from './parser/ast.js'
import { ComponentParser } from './parser/componentParser.js'
import { PathParser } from './parser/pathParser.js'

export class CodeGenerator {
  private componentParser: ComponentParser
  private pathParser: PathParser
  private openApiObject: OpenAPIObject
  constructor(
    private readonly fileManager: FileManager,
    private readonly generateComponents: boolean,
    private readonly generatePaths: boolean,
    private readonly generateQueries: boolean,
  ) {
    this.componentParser = new ComponentParser()
    this.pathParser = new PathParser()
    this.openApiObject = this.resolveSchemaReferences()
  }

  /**
   * Resolves all schema references within the OpenAPI object,
   * replacing each $ref with the pure schema object.
   *
   * @returns A new OpenAPIObject with resolved schema references.
   */
  private resolveSchemaReferences() {
    const openApiObject = { ...this.fileManager.openApiObject }

    if (openApiObject.components?.schemas) {
      for (const name in openApiObject.components.schemas) {
        const schema = openApiObject.components.schemas[name]
        openApiObject.components.schemas[name] = this.toPureSchemaObject(openApiObject, schema)
      }
    }

    return openApiObject
  }

  /**
   * Checks if a schema object or any of its children contain a ReferenceObject.
   *
   * @param obj - The schema object to check for references.
   * @returns A boolean indicating if there is a reference object.
   */
  private hasReferenceObject(obj: SchemaObject): boolean {
    const children = [...obj.allOf ?? [], ...obj.anyOf ?? [], ...obj.oneOf ?? []]
    obj.items && children.push(obj.items)

    if (obj.additionalProperties && isReferenceObject(obj.additionalProperties)) {
      return true
    }
    for (const child of children) {
      if (isReferenceObject(child) || this.hasReferenceObject(child)) {
        return true
      }
    }
    for (const name in obj.properties) {
      const schema = obj.properties[name]
      if (isReferenceObject(schema) || this.hasReferenceObject(schema)) {
        return true
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
  private toPureSchemaObject(
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
        return this.toPureSchemaObject(openApiObject, schema)
      }
      else if (this.hasReferenceObject(schema)) {
        return this.toPureSchemaObject(openApiObject, schema)
      }
      else {
        return schema
      }
    }

    if (!this.hasReferenceObject(obj)) {
      return obj
    }

    const schema = obj
    schema.allOf = schema.allOf?.map(obj => this.toPureSchemaObject(openApiObject, obj))
    schema.anyOf = schema.anyOf?.map(obj => this.toPureSchemaObject(openApiObject, obj))
    schema.oneOf = schema.oneOf?.map(obj => this.toPureSchemaObject(openApiObject, obj))
    schema.items = schema.items ? this.toPureSchemaObject(openApiObject, schema.items) : undefined
    schema.additionalProperties
      = schema.additionalProperties && isReferenceObject(schema.additionalProperties)
        ? this.toPureSchemaObject(openApiObject, schema.additionalProperties)
        : undefined

    const newProperties = schema.properties ?? {}
    for (const name in schema.properties) {
      newProperties[name] = this.toPureSchemaObject(openApiObject, schema.properties[name])
    }
    schema.properties = newProperties

    return schema
  }

  public generate() {
    const outputNodes: ts.Node[] = []

    // add import declaration
    outputNodes.push(ast.createZodImportDeclaration())

    if (this.openApiObject.components) {
      if (this.generateComponents) {
        const nodes = this.componentParser.toAst(this.openApiObject.components)
        if (nodes.length > 0) {
          nodes[0] = ast.addMultiLineComment(componentsComment, nodes[0])
        }
        outputNodes.push(...nodes)
      }
    }
    if (this.openApiObject.paths) {
      if (this.generatePaths) {
        const nodes = this.pathParser.toAstPath(this.openApiObject.paths)
        if (nodes.length > 0) {
          nodes[0] = ast.addMultiLineComment(pathsComment, nodes[0])
        }
        outputNodes.push(...nodes)
      }
      if (this.generateQueries) {
        const nodes = this.pathParser.toAstQuey(this.openApiObject.paths)
        if (nodes.length > 0) {
          nodes[0] = ast.addMultiLineComment(queriesComment, nodes[0])
        }
        outputNodes.push(...nodes)
      }
    }

    const output = this.printAst(outputNodes)
    this.fileManager.write(output)
  }

  private printAst(ast: ts.Node[]) {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
    const file = ts.createSourceFile('', '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
    const result = ast.map(node => printer.printNode(ts.EmitHint.Unspecified, node, file))

    return result.join(EOL + EOL)
  }
}

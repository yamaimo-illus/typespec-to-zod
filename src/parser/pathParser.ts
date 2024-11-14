import type { OperationObject, PathsObject, SchemaObject } from 'openapi3-ts/oas31'
import type { Node } from 'typescript'
import consola from 'consola'
import c from '../constants'
import ast from './ast'
import utils from './utils'

const methods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']

export class PathParser {
  private toSchemas(operationObject: OperationObject, inType: 'path' | 'query') {
    const parameters = operationObject.parameters ?? []
    const schema: SchemaObject = { type: 'object', properties: {} }

    for (const parameter of parameters) {
      if (ast.isParameterObject(parameter)) {
        const name = parameter.name
        if (parameter.schema && parameter.in === inType) {
          schema.properties![name] = parameter.schema
        }
      }
      else {
        consola.warn('[PathParser]: ReferenceObject is not supported.', parameter)
      }
    }

    return Object.entries(schema.properties ?? {}).length > 0
      ? schema
      : undefined
  }

  public toAstPath(pathsObject: PathsObject) {
    const nodes: Node[] = []

    for (const [_path, pathItemObject] of Object.entries(pathsObject)) {
      for (const method of methods) {
        const key = method as keyof typeof pathItemObject
        const operationObject: OperationObject | undefined = pathItemObject[key]
        if (!operationObject) {
          continue
        }

        const operationId = operationObject.operationId
        const schema = this.toSchemas(operationObject, 'path')
        if (schema) {
          const statement = ast.createZodVariableStatement(
            utils.toCamelcase(`${c.PATH_PREFIX}_${operationId}`),
            schema,
          )
          nodes.push(statement)
        }
      }
    }
    return nodes
  }

  public toAstQuey(pathsObject: PathsObject) {
    const nodes: Node[] = []

    for (const [_path, pathItemObject] of Object.entries(pathsObject)) {
      for (const method of methods) {
        const key = method as keyof typeof pathItemObject
        const operationObject: OperationObject | undefined = pathItemObject[key]
        if (!operationObject) {
          continue
        }

        const operationId = operationObject.operationId
        const schema = this.toSchemas(operationObject, 'query')
        if (schema) {
          const statement = ast.createZodVariableStatement(
            utils.toCamelcase(`${c.QUERY_PREFIX}_${operationId}`),
            schema,
          )
          nodes.push(statement)
        }
      }
    }
    return nodes
  }
}

import type { Node } from 'typescript'
import consola from 'consola'
import {
  isReferenceObject,
  type OperationObject,
  type PathsObject,
  type SchemaObject,
} from 'openapi3-ts/oas31'
import utils from '../utils'
import ast from './ast'

const methods = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace']

export class PathParser {
  private toSchemas(
    operationObject: OperationObject,
    inType: 'path' | 'query',
  ) {
    const parameters = operationObject.parameters ?? []
    const schema: SchemaObject = { type: 'object', properties: {} }

    for (const parameter of parameters) {
      if (!isReferenceObject(parameter)) {
        const name = parameter.name
        if (parameter.schema && parameter.in === inType) {
          schema.properties![name] = parameter.schema
        }
      }
      else {
        consola.log('[PathParser]: ReferenceObject not supported.', parameter)
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
            utils.toCamelcase(`${operationId}_${method}_path`),
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
            utils.toCamelcase(`${operationId}_${method}_query`),
            schema,
          )
          nodes.push(statement)
        }
      }
    }
    return nodes
  }
}

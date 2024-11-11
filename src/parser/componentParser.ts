import type { ComponentsObject } from 'openapi3-ts/oas31'
import type { Node } from 'typescript'
import { schemaPrefix } from '../constants'
import utils from '../utils'
import ast from './ast'

export class ComponentParser {
  public toAst(componentsObject: ComponentsObject) {
    const nodes: Node[] = []

    if (componentsObject.schemas) {
      for (const [name, schema] of Object.entries(componentsObject.schemas)) {
        const variableName = utils.toCamelcase(`${schemaPrefix}_${name}`)
        const statement = ast.createZodVariableStatement(variableName, schema)
        nodes.push(statement)
      }
    }

    return nodes
  }
}

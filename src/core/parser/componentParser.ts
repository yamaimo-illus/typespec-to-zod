import type { ComponentsObject } from 'openapi3-ts/oas31'
import type { Node } from 'typescript'
import utils from '../utils'
import ast from './ast'

export class ComponentParser {
  public toAst(componentsObject: ComponentsObject) {
    const nodes: Node[] = []

    if (componentsObject.schemas) {
      for (const [name, obj] of Object.entries(componentsObject.schemas)) {
        const statement = ast.createZodVariableStatement(utils.toCamelcase(name), obj)
        nodes.push(statement)
      }
    }

    return nodes
  }
}

import type { OpenAPIObject } from 'openapi3-ts/oas31'
import type ts from 'typescript'
import c from './constants.js'
import ast from './parser/ast.js'
import { ComponentParser } from './parser/componentParser.js'
import { PathParser } from './parser/pathParser.js'

export class CodeGenerator {
  private componentParser: ComponentParser
  private pathParser: PathParser

  constructor(
    private readonly openApiObject: OpenAPIObject,
    private readonly onWrite: (output: string) => void,
    private readonly generateComponents: boolean,
    private readonly generatePaths: boolean,
    private readonly generateQueries: boolean,
  ) {
    this.componentParser = new ComponentParser()
    this.pathParser = new PathParser()
    this.openApiObject = ast.resolveSchemaReferences(openApiObject)
  }

  public generate() {
    const outputNodes: ts.Node[] = []

    // add import declaration
    outputNodes.push(ast.createZodImportAst())

    // add components
    if (this.openApiObject.components) {
      if (this.generateComponents) {
        const nodes = this.componentParser.toAst(this.openApiObject.components)
        if (nodes.length > 0) {
          nodes[0] = ast.applyComment(c.COMPONENTS_COMMENT, 'multiple', nodes[0])
        }
        outputNodes.push(...nodes)
      }
    }

    // add paths
    if (this.openApiObject.paths) {
      if (this.generatePaths) {
        const nodes = this.pathParser.toAstPath(this.openApiObject.paths)
        if (nodes.length > 0) {
          nodes[0] = ast.applyComment(c.PATHS_COMMENT, 'multiple', nodes[0])
        }
        outputNodes.push(...nodes)
      }
      if (this.generateQueries) {
        const nodes = this.pathParser.toAstQuey(this.openApiObject.paths)
        if (nodes.length > 0) {
          nodes[0] = ast.applyComment(c.QUERIES_COMMENT, 'multiple', nodes[0])
        }
        outputNodes.push(...nodes)
      }
    }

    this.onWrite(ast.printAst(outputNodes))
  }
}

import type { FileManager } from './fileManager.js'
import { EOL } from 'node:os'
import ts from 'typescript'
import { componentsComment, pathsComment, queriesComment } from './constants.js'
import ast from './parser/ast.js'
import { ComponentParser } from './parser/componentParser.js'
import { PathParser } from './parser/pathParser.js'

export class CodeGenerator {
  private componentParser: ComponentParser
  private pathParser: PathParser
  constructor(
    private readonly fileManager: FileManager,
    private readonly generateComponents: boolean,
    private readonly generatePaths: boolean,
    private readonly generateQueries: boolean,
  ) {
    this.componentParser = new ComponentParser()
    this.pathParser = new PathParser()
  }

  public generate() {
    const openApiObject = this.fileManager.openApiObject
    const outputNodes: ts.Node[] = []

    // add import declaration
    outputNodes.push(ast.createZodImportDeclaration())

    if (openApiObject.components) {
      if (this.generateComponents) {
        const nodes = this.componentParser.toAst(openApiObject.components)
        nodes[0] = ast.addMultiLineComment(componentsComment, nodes[0])

        outputNodes.push(...nodes)
      }
    }
    if (openApiObject.paths) {
      if (this.generatePaths) {
        const nodes = this.pathParser.toAstPath(openApiObject.paths)
        nodes[0] = ast.addMultiLineComment(pathsComment, nodes[0])

        outputNodes.push(...nodes)
      }
      if (this.generateQueries) {
        const nodes = this.pathParser.toAstQuey(openApiObject.paths)
        nodes[0] = ast.addMultiLineComment(queriesComment, nodes[0])

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

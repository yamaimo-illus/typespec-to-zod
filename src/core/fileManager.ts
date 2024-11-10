import type { OpenAPIObject } from 'openapi3-ts/oas31'
import fs from 'node:fs'
import consola from 'consola'
import { parse } from 'yaml'

export class FileManager {
  private openApiObject: OpenAPIObject
  constructor(
    private readonly inputPath: string,
    private readonly outputPath: string,
  ) {
    this.openApiObject = this.load(this.inputPath)

    // TODO: validate yaml
  }

  private load(input: string) {
    const file = fs.readFileSync(input, 'utf-8')
    return parse(file)
  }

  public write(output: string) {
    try {
      fs.writeFileSync(this.outputPath, output, 'utf-8')
      consola.success(`Data successfully written to ${this.outputPath}`)
    }
    catch (e) {
      consola.error(`Failed to write data to ${this.outputPath}:`, e)
    }
  }

  public get components() {
    return this.openApiObject.components
  }

  public get paths() {
    return this.openApiObject.paths
  }
}

import type { OpenAPIObject } from 'openapi3-ts/oas31'
import * as fs from 'node:fs'
import path from 'node:path'
import { Validator } from '@seriousme/openapi-schema-validator'
import consola from 'consola'

export class FileManager {
  constructor(
    private readonly inputPath: string,
    private readonly outputPath: string,
  ) { }

  public async load() {
    const validator = new Validator()
    const res = await validator.validate(this.inputPath)
    if (!res.valid) {
      throw res.errors
    }
    return validator.resolveRefs() as OpenAPIObject
  }

  public write(output: string) {
    try {
      const dir = path.dirname(this.outputPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        consola.info(`Created output directory: ${dir}`)
      }
      fs.writeFileSync(this.outputPath, output, 'utf-8')
      consola.success(`File successfully written to: ${this.outputPath}`)
    }
    catch (e) {
      consola.error(`Failed to write output file at ${this.outputPath}:`, e)
    }
  }
}

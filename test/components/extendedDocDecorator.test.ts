import { describe, expect, it } from 'vitest'
import { CodeGenerator } from '../../src/codeGenerator.js'
import { FileManager } from '../../src/fileManager.js'

describe('extended doc decorator code generation', () => {
  it('generates zod schema for decorators', async () => {
    const fileManager = new FileManager('test/components/__snapshots__/extendedDocDecorator.yaml', 'dummy.ts')
    const openApiObject = await fileManager.load()

    let result: string = ''
    const generator = new CodeGenerator(openApiObject, output => result = output, true, true, true)
    generator.generate()

    await expect(result).toMatchFileSnapshot('__snapshots__/extendedDocDecorator.ts')
  })
})

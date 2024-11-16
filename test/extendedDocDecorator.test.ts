import { describe, expect, it } from 'vitest'
import { CodeGenerator } from '../src/codeGenerator.js'
import { FileManager } from '../src/fileManager.js'

describe('extended doc decorator code generation', () => {
  it('generates zod schema for decorators', async () => {
    const fileManager = new FileManager('test/__snapshots__/extendedDocDecorator.yaml', 'dummy.ts')
    const openApiObject = await fileManager.load()
    let result: string = ''
    const codeGenerator = new CodeGenerator(
      openApiObject,
      output => result = output,
      true,
      true,
      true,
    )
    codeGenerator.generate()

    await expect(result).toMatchFileSnapshot('__snapshots__/extendedDocDecorator.ts')
  })
})

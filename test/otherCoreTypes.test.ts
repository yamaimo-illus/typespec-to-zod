import { describe, expect, it } from 'vitest'
import { CodeGenerator } from '../src/codeGenerator.js'
import { FileManager } from '../src/fileManager.js'

describe('other core types code generation', () => {
  it('generates zod schema for other core types', async () => {
    const fileManager = new FileManager('test/__snapshots__/otherCoreTypes.yaml', 'dummy.ts')
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

    await expect(result).toMatchFileSnapshot('__snapshots__/otherCoreTypes.ts')
  })
})

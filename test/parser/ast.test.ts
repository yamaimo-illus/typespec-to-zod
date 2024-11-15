import { describe, expect, it } from 'vitest'
import ast from '../../src/parser/ast'

describe('parser/ast', () => {
  it('extracts schema name from JSON reference', () => {
    expect(ast.getSchemaNameFromRef('#/components/schemas/Pet')).toBe('Pet')
    expect(ast.getSchemaNameFromRef('#/components/schemas/Order')).toBe('Order')
    expect(ast.getSchemaNameFromRef('#/parameters/Param')).toBe('Param')
  })

  it('creates a Zod import AST correctly', () => {
    const node = ast.createZodImportAst()
    expect(ast.printAst([node])).toBe('import { z } from "zod";')
  })

  it('creates a Zod property access AST correctly', () => {
    const node = ast.createZodPropertyAccessAst('string')
    expect(ast.printAst([node])).toBe('z.string')
  })
})

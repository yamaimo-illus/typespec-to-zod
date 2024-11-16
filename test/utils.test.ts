import { describe, expect, it } from 'vitest'
import utils from '../src/parser/utils'

describe('parser/utils', () => {
  it('converts various string formats to camelcase', () => {
    expect(utils.toCamelcase('hello world')).toBe('helloWorld')
    expect(utils.toCamelcase('HelloWorld')).toBe('helloWorld')
    expect(utils.toCamelcase('hello-world')).toBe('helloWorld')
  })
})

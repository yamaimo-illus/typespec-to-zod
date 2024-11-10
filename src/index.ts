#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import packageJson from '../package.json'
import { CodeGenerator } from './core/codeGenerator.js'
import { FileManager } from './core/fileManager.js'

const main = defineCommand({
  meta: {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
  },
  args: {
    input: {
      type: 'string',
      alias: ['i'],
      description: 'Input .yaml path',
      required: true,
    },
    output: {
      type: 'string',
      alias: ['o'],
      description: 'Output .ts path',
      required: true,
    },
    generateComponents: {
      type: 'boolean',
      alias: ['c'],
      description: 'Generate components',
      required: false,
      default: true,
    },
    generatePaths: {
      type: 'boolean',
      alias: ['p'],
      description: 'Generate paths',
      required: false,
      default: false,
    },
    generateQueries: {
      type: 'boolean',
      alias: ['q'],
      description: 'Generate queries',
      required: false,
      default: false,
    },
  },
  run({ args }) {
    const fileManager = new FileManager(args.input, args.output)

    const codeGenerator = new CodeGenerator(
      fileManager,
      args.generateComponents,
      args.generatePaths,
      args.generateQueries,
    )
    codeGenerator.generate()
  },
})

runMain(main)

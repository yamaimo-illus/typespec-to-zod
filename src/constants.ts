const SCHEMA_PREFIX = 'schema'
const PATH_PREFIX = 'path'
const QUERY_PREFIX = 'query'

const COMPONENTS_COMMENT
  = `
 ██████╗ ██████╗ ███╗   ███╗██████╗  ██████╗ ███╗   ██╗███████╗███╗   ██╗████████╗███████╗
██╔════╝██╔═══██╗████╗ ████║██╔══██╗██╔═══██╗████╗  ██║██╔════╝████╗  ██║╚══██╔══╝██╔════╝
██║     ██║   ██║██╔████╔██║██████╔╝██║   ██║██╔██╗ ██║█████╗  ██╔██╗ ██║   ██║   ███████╗
██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██║   ██║██║╚██╗██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║
╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ╚██████╔╝██║ ╚████║███████╗██║ ╚████║   ██║   ███████║
 ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝
`

const PATHS_COMMENT
  = `
██████╗  █████╗ ████████╗██╗  ██╗███████╗
██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██╔════╝
██████╔╝███████║   ██║   ███████║███████╗
██╔═══╝ ██╔══██║   ██║   ██╔══██║╚════██║
██║     ██║  ██║   ██║   ██║  ██║███████║
╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚══════╝
`

const QUERIES_COMMENT
  = `
 ██████╗ ██╗   ██╗███████╗██████╗ ██╗███████╗███████╗
██╔═══██╗██║   ██║██╔════╝██╔══██╗██║██╔════╝██╔════╝
██║   ██║██║   ██║█████╗  ██████╔╝██║█████╗  ███████╗
██║▄▄ ██║██║   ██║██╔══╝  ██╔══██╗██║██╔══╝  ╚════██║
╚██████╔╝╚██████╔╝███████╗██║  ██║██║███████╗███████║
 ╚══▀▀═╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝
`

/**
 * @see https://www.w3schools.com/js/js_reserved.asp
 */
const TS_RESERVED_KEYWORDS = [
  'abstract',
  'arguments',
  'await',
  'boolean',
  'break',
  'byte',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'double',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'final',
  'finally',
  'float',
  'for',
  'function',
  'goto',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'int',
  'interface',
  'let',
  'long',
  'native',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'static',
  'super',
  'switch',
  'synchronized',
  'this',
  'throw',
  'throws',
  'transient',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'volatile',
  'while',
  'with',
  'yield',
]

export default {
  SCHEMA_PREFIX,
  PATH_PREFIX,
  QUERY_PREFIX,
  COMPONENTS_COMMENT,
  PATHS_COMMENT,
  QUERIES_COMMENT,
  TS_RESERVED_KEYWORDS,
}

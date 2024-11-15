/**
 * Converts a given string to camelCase format.
 *
 * @param text - The string to be converted to camelCase.
 * @returns The camelCase version of the input string.
 *
 * @example
 * // Convert various string formats to camelCase
 * toCamelcase('hello world');       // returns 'helloWorld'
 * toCamelcase('HelloWorld');        // returns 'helloWorld'
 * toCamelcase('hello-world');       // returns 'helloWorld'
 */
function toCamelcase(text: string): string {
  return text
    .split(/(?=[A-Z])|[\s_\-]+/)
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('')
}

export default {
  toCamelcase,
}

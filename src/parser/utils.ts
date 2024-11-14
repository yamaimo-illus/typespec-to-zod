function toCamelcase(text: string): string {
  return text.split(/(?=[A-Z])|[\s_\-]+/).map((word, index) =>
    index === 0
      ? word.toLowerCase()
      : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
  ).join('')
}

export default {
  toCamelcase,
}

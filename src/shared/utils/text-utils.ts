/**
 * Converts a snake_case string to camelCase.
 * @param str snake_case string
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * Capitalizes the first letter of a string.
 * @param str input string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

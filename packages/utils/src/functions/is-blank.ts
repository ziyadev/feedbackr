/** Returns true for null, undefined, an empty string, or a whitespace-only string. */
export const isBlank = (value: string | null | undefined): boolean =>
  value == null || value.trim() === '';

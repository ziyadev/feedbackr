/** Returns true for null, undefined, empty or whitespace-only strings. */
export const isBlank = (value: string | null | undefined): boolean =>
  value == null || value.trim() === '';

/** Truncates text; the result never exceeds `length`. */
export const truncate = (
  str: string | null | undefined,
  length: number
): string | null => {
  if (!str || str.length <= length) return str ?? null;
  if (length <= 3) return str.slice(0, Math.max(length, 0));
  return `${str.slice(0, length - 3)}...`;
};

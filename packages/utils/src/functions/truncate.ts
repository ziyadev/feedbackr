/** Slices to at most `length` UTF-16 units without leaving a dangling high surrogate. */
export const safeSlice = (str: string, length: number): string => {
  const cut = str.slice(0, Math.max(length, 0));
  return cut.length < str.length && /[\uD800-\uDBFF]$/.test(cut)
    ? cut.slice(0, -1)
    : cut;
};

/** Truncates text; the result never exceeds `length`. */
export const truncate = (
  str: string | null | undefined,
  length: number
): string | null => {
  if (!str || str.length <= length) return str ?? null;
  if (length <= 3) return safeSlice(str, length);
  return `${safeSlice(str, length - 3)}...`;
};

export interface FormatCompactNumberOptions {
  /** Maximum fraction digits for scaled values (0–3). Defaults to 1. */
  decimals?: number;
}

const UNITS = [
  { size: 1e9, suffix: 'B' },
  { size: 1e6, suffix: 'M' },
  { size: 1e3, suffix: 'k' },
];

/**
 * Formats a number compactly using short-scale suffixes: `k` (thousand),
 * `M` (million), `B` (billion). Values below 1000 have no suffix. Trailing
 * zeros are dropped ("1000" -> "1k") and values that round up to the next
 * scale are promoted ("999999" -> "1M"). Implemented by hand rather than with
 * `Intl.NumberFormat` compact notation, whose output varies across runtimes.
 *
 * Promotion stops at `B`: there is no trillion unit, so 1e12 prints "1000B".
 * Non-finite values are returned as `String(value)` ("Infinity", "NaN").
 *
 * @throws RangeError if `decimals` is not an integer from 0 to 3.
 */
export function formatCompactNumber(
  value: number,
  options: FormatCompactNumberOptions = {},
): string {
  const { decimals = 1 } = options;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 3) {
    throw new RangeError(
      `Invalid decimals value ${decimals}: must be an integer between 0 and 3 inclusive`,
    );
  }
  if (!Number.isFinite(value)) return String(value);

  const round = (n: number) => Number(n.toFixed(decimals));
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  let index = UNITS.findIndex((u) => abs >= u.size);
  if (index === -1) {
    const rounded = round(abs);
    // Below 1000 but rounds up to 1000 (e.g. 999.9996) -> promote to "1k".
    if (rounded < 1000) return rounded === 0 ? '0' : `${sign}${rounded}`;
    index = UNITS.length - 1;
  }

  let unit = UNITS[index];
  let scaled = round(abs / unit.size);
  if (scaled >= 1000 && index > 0) {
    unit = UNITS[index - 1];
    scaled = round(abs / unit.size);
  }
  return `${sign}${scaled}${unit.suffix}`;
}

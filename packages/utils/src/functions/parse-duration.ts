const UNIT_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

const PART = /^\s*(-?)(\d+(?:\.\d+)?|\.\d+)\s*([a-zA-Z]*)/;

/** Parses a duration like '1h30m' or '1.5h' into milliseconds; throws RangeError on invalid input. */
export const parseDuration = (input: string): number => {
  if (input.trim() === '') {
    throw new RangeError('Duration must not be empty');
  }

  const seen = new Set<string>();
  let rest = input;
  let total = 0;

  while (rest.trim() !== '') {
    const match = PART.exec(rest);
    if (!match) {
      throw new RangeError(`Invalid duration "${input}" near "${rest.trim()}"`);
    }
    const [whole, sign, value, unit] = match;

    if (sign) {
      throw new RangeError(`Negative durations are not allowed: "${input}"`);
    }
    if (!Object.prototype.hasOwnProperty.call(UNIT_MS, unit)) {
      throw new RangeError(
        `Unknown unit "${unit}" in duration "${input}" (expected ms, s, m, h, d or w)`
      );
    }
    if (seen.has(unit)) {
      throw new RangeError(`Repeated unit "${unit}" in duration "${input}"`);
    }

    seen.add(unit);
    total += parseFloat(value) * UNIT_MS[unit];
    rest = rest.slice(whole.length);
  }

  return total;
};

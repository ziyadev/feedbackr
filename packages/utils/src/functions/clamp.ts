/** Clamps `value` to the inclusive range [min, max]; throws RangeError when min > max or either bound is NaN. */
export const clamp = (value: number, min: number, max: number): number => {
  if (!(min <= max)) {
    throw new RangeError(
      `clamp: min (${min}) must not be greater than max (${max})`
    );
  }
  return Math.min(Math.max(value, min), max);
};

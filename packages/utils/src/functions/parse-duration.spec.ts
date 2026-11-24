import { parseDuration } from './parse-duration';

describe('parseDuration', () => {
  it.each([
    ['500ms', 500],
    ['45s', 45_000],
    ['5m', 300_000],
    ['2d', 172_800_000],
    ['1w', 604_800_000],
    ['1h30m', 5_400_000],
    ['1h 15m', 4_500_000],
    ['1w 2d', 777_600_000],
    ['  1h   30m  ', 5_400_000],
    ['1 h', 3_600_000],
    ['1d2h3m4s5ms', 93_784_005],
  ])('parses %p as %p ms', (input, expected) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it.each([
    ['1.5h', 5_400_000],
    ['0.5s', 500],
    ['1.5h 30s', 5_430_000],
  ])('supports decimals: %p', (input, expected) => {
    expect(parseDuration(input)).toBe(expected);
  });

  it.each(['', '   ', '\t\n'])(
    'throws a RangeError for empty input %p',
    (input) => {
      expect(() => parseDuration(input)).toThrow(RangeError);
      expect(() => parseDuration(input)).toThrow(/empty/i);
    }
  );

  it.each(['5x', '1y', '10min', '5H', '5constructor'])(
    'throws a RangeError for unknown unit in %p',
    (input) => {
      expect(() => parseDuration(input)).toThrow(RangeError);
      expect(() => parseDuration(input)).toThrow(/unknown unit/i);
    }
  );

  it('throws a RangeError for a number without a unit', () => {
    expect(() => parseDuration('30')).toThrow(RangeError);
    expect(() => parseDuration('1h 30')).toThrow(RangeError);
  });

  it.each(['1h 2h', '1h30m5m', '1s1s'])(
    'throws a RangeError for repeated units in %p',
    (input) => {
      expect(() => parseDuration(input)).toThrow(RangeError);
      expect(() => parseDuration(input)).toThrow(/repeated unit/i);
    }
  );

  it.each(['-5s', '1h -30m'])(
    'throws a RangeError for negative numbers in %p',
    (input) => {
      expect(() => parseDuration(input)).toThrow(RangeError);
      expect(() => parseDuration(input)).toThrow(/negative/i);
    }
  );

  it.each(['1h abc', '1h,30m', 'abc', '1h30m!', 'h', '1..5h'])(
    'throws a RangeError for trailing garbage in %p',
    (input) => {
      expect(() => parseDuration(input)).toThrow(RangeError);
    }
  );
});

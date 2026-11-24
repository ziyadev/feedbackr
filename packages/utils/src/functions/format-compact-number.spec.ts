import { formatCompactNumber } from './format-compact-number';

describe('formatCompactNumber', () => {
  it.each([
    [0, '0'],
    [999, '999'],
    [1000, '1k'],
    [1500, '1.5k'],
    [999999, '1M'],
    [1000000, '1M'],
    [1532981, '1.5M'],
    [2500000000, '2.5B'],
    [-1500, '-1.5k'],
    [-999, '-999'],
    [-0, '0'],
    [12.345, '12.3'],
    [999.96, '1k'],
    [1e12, '1000B'],
    [2.5e12, '2500B'],
    [Infinity, 'Infinity'],
    [-Infinity, '-Infinity'],
    [NaN, 'NaN'],
  ])('formats %p as %p', (value, expected) => {
    expect(formatCompactNumber(value)).toBe(expected);
  });

  it('respects decimals 0 and 3', () => {
    expect(formatCompactNumber(1532981, { decimals: 0 })).toBe('2M');
    expect(formatCompactNumber(1532981, { decimals: 3 })).toBe('1.533M');
  });

  it.each([-1, 4, 1.5, NaN])('throws a RangeError for decimals %p', (decimals) => {
    expect(() => formatCompactNumber(1000, { decimals })).toThrow(RangeError);
    expect(() => formatCompactNumber(1000, { decimals })).toThrow(
      `Invalid decimals value ${decimals}: must be an integer between 0 and 3 inclusive`,
    );
  });
});

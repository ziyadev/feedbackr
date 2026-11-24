import { currencyFormatter } from './currency-formatter';

describe('currencyFormatter', () => {
  it('formats zero', () => {
    expect(currencyFormatter(0)).toBe('$0');
  });

  it('formats negative amounts', () => {
    expect(currencyFormatter(-1234)).toBe('-$1,234');
  });

  it('rounds to whole dollars by default', () => {
    expect(currencyFormatter(1.4)).toBe('$1');
    expect(currencyFormatter(1.6)).toBe('$2');
  });

  it('honours fraction digit overrides', () => {
    expect(
      currencyFormatter(1234.5, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    ).toBe('$1,234.50');
  });

  it('supports other currencies', () => {
    expect(currencyFormatter(1000, { currency: 'EUR' })).toBe('€1,000');
    expect(currencyFormatter(1000, { currency: 'JPY' })).toBe('¥1,000');
  });

  it('formats large numbers', () => {
    expect(currencyFormatter(1234567890123)).toBe('$1,234,567,890,123');
  });

  it('handles non-finite and NaN input', () => {
    expect(currencyFormatter(NaN)).toBe('$NaN');
    expect(currencyFormatter(Infinity)).toBe('$∞');
  });

  it('throws on an invalid currency code', () => {
    expect(() => currencyFormatter(1, { currency: 'nope' })).toThrow(
      RangeError
    );
  });
});

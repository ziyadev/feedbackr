import { isBlank } from './is-blank';

describe('isBlank', () => {
  it('returns true for null and undefined', () => {
    expect(isBlank(null)).toBe(true);
    expect(isBlank(undefined)).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isBlank('')).toBe(true);
  });

  it('returns true for whitespace-only strings', () => {
    expect(isBlank('   ')).toBe(true);
    expect(isBlank(' \t\n\r ')).toBe(true);
  });

  it('returns true for non-breaking and em spaces', () => {
    expect(isBlank(' \u00a0\u2003 ')).toBe(true);
  });

  it('returns false for strings with content', () => {
    expect(isBlank('a')).toBe(false);
    expect(isBlank('  a  ')).toBe(false);
    expect(isBlank('0')).toBe(false);
  });
});

import { isBlank } from './is-blank';

describe('isBlank', () => {
  it('returns true for null and undefined', () => {
    expect(isBlank(null)).toBe(true);
    expect(isBlank(undefined)).toBe(true);
  });

  it('returns true for an empty string', () => {
    expect(isBlank('')).toBe(true);
  });

  it('returns true for whitespace-only strings', () => {
    expect(isBlank('   ')).toBe(true);
    expect(isBlank('\t\n\r ')).toBe(true);
  });

  it('treats NBSP as whitespace (stripped by trim)', () => {
    expect(isBlank('\u00A0')).toBe(true);
    expect(isBlank(' \u00A0 ')).toBe(true);
  });

  it('does not treat zero-width space as whitespace (not stripped by trim)', () => {
    expect(isBlank('\u200B')).toBe(false);
    expect(isBlank(' \u200B ')).toBe(false);
  });

  it('returns false for strings with content', () => {
    expect(isBlank('a')).toBe(false);
    expect(isBlank('  a  ')).toBe(false);
  });
});

import { normalizeString } from './normalize-string';

describe('normalizeString', () => {
  it('lowercases and trims normal input', () => {
    expect(normalizeString('  Hello World  ')).toBe('hello world');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeString('')).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(normalizeString('   ')).toBe('');
  });

  it('collapses repeated spaces', () => {
    expect(normalizeString('a    b')).toBe('a b');
  });

  it('treats tabs and newlines as word separators', () => {
    expect(normalizeString('a\tb')).toBe('a b');
    expect(normalizeString('a\nb')).toBe('a b');
    expect(normalizeString('a\r\nb')).toBe('a b');
  });

  it('removes a leading BOM', () => {
    expect(normalizeString('﻿Hello')).toBe('hello');
  });

  it('removes non-printable control characters', () => {
    expect(normalizeString('a\u0000b\u0007c\u007Fd')).toBe('abcd');
  });

  it('lowercases unicode letters', () => {
    expect(normalizeString('ÉCOLE ÀÜ')).toBe('école àü');
  });

  it('preserves non-latin characters and emoji', () => {
    expect(normalizeString('日本語 😀')).toBe('日本語 😀');
  });

  it('is idempotent', () => {
    const once = normalizeString(' ﻿Foo\t Bar ');
    expect(normalizeString(once)).toBe(once);
  });
});

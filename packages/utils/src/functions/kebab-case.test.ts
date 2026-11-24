import { kebabCase } from './kebab-case';

describe('kebabCase', () => {
  it('converts camelCase and PascalCase', () => {
    expect(kebabCase('fooBar')).toBe('foo-bar');
    expect(kebabCase('FooBar')).toBe('foo-bar');
  });

  it('converts snake_case, spaces and hyphens', () => {
    expect(kebabCase('foo_bar')).toBe('foo-bar');
    expect(kebabCase('foo bar')).toBe('foo-bar');
    expect(kebabCase('foo-bar')).toBe('foo-bar');
  });

  it('handles mixed separators', () => {
    expect(kebabCase('Foo Bar_baz')).toBe('foo-bar-baz');
    expect(kebabCase('  foo__bar--baz  ')).toBe('foo-bar-baz');
  });

  it('splits consecutive capitals (acronyms)', () => {
    expect(kebabCase('XMLHttpRequest')).toBe('xml-http-request');
    expect(kebabCase('getHTTPResponse')).toBe('get-http-response');
  });

  it('returns an empty string for empty input', () => {
    expect(kebabCase('')).toBe('');
  });
});

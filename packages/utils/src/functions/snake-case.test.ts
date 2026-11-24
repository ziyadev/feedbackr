import { snakeCase } from './snake-case';

describe('snakeCase', () => {
  it('converts camelCase and PascalCase', () => {
    expect(snakeCase('fooBar')).toBe('foo_bar');
    expect(snakeCase('FooBar')).toBe('foo_bar');
  });

  it('splits consecutive capitals (acronyms)', () => {
    expect(snakeCase('XMLHttpRequest')).toBe('xml_http_request');
    expect(snakeCase('getHTTPResponse')).toBe('get_http_response');
    expect(snakeCase('parseURL')).toBe('parse_url');
  });

  it('converts kebab-case, spaces and underscores', () => {
    expect(snakeCase('foo-bar')).toBe('foo_bar');
    expect(snakeCase('foo bar')).toBe('foo_bar');
    expect(snakeCase('foo_bar')).toBe('foo_bar');
  });

  it('handles mixed separators', () => {
    expect(snakeCase('Foo Bar-baz')).toBe('foo_bar_baz');
  });

  it('collapses repeated separators and trims the ends', () => {
    expect(snakeCase('  foo -- bar__baz  ')).toBe('foo_bar_baz');
  });

  it('returns an empty string for empty input', () => {
    expect(snakeCase('')).toBe('');
  });
});

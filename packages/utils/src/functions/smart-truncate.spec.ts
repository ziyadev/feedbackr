import { smartTruncate } from './smart-truncate';

describe('smartTruncate', () => {
  it('returns the link unchanged when under the limit', () => {
    expect(smartTruncate('example.com/a', 50)).toBe('example.com/a');
  });

  it('returns the link unchanged when exactly at the limit', () => {
    const link = 'example.com/abc';
    expect(smartTruncate(link, link.length)).toBe(link);
  });

  it('truncates the path first and keeps the domain', () => {
    expect(smartTruncate('example.com/some/long/path/here', 25)).toBe(
      'example...com/some/long/path...'
    );
  });

  it('truncates a long domain while preserving the TLD', () => {
    const result = smartTruncate(
      'averyveryverylongsubdomain.example.com/p',
      20
    );
    expect(result.startsWith('averyveryv')).toBe(true);
    expect(result).toContain('...com/');
  });

  it('does not throw for a limit of 0', () => {
    expect(() => smartTruncate('example.com/path', 0)).not.toThrow();
  });

  it('returns the link unchanged for an empty string', () => {
    expect(smartTruncate('', 0)).toBe('');
  });

  it('does not throw on emoji characters', () => {
    expect(() =>
      smartTruncate('example.com/😀😀😀😀😀😀😀😀', 15)
    ).not.toThrow();
  });
});

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
      'example.com/some/long/...'
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

  it('never returns more than maxLength characters', () => {
    const links = [
      'example.com/some/long/path/here',
      'averyveryverylongsubdomain.example.com/p',
      'example.com/path',
    ];
    for (const link of links) {
      for (const max of [0, 1, 5, 8, 12, 20, 25]) {
        expect(smartTruncate(link, max).length).toBeLessThanOrEqual(max);
      }
    }
  });

  it('does not split a surrogate pair when truncating emoji', () => {
    const lone =
      /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
    for (let max = 0; max < 30; max++) {
      const result = smartTruncate('example.com/😀😀😀😀😀😀😀😀', max);
      expect(result).not.toMatch(lone);
    }
  });
});

describe('smartTruncate short domains', () => {
  it('does not over-truncate a domain that nearly fits', () => {
    expect(smartTruncate('example.com/some/long/path/here', 25)).toBe(
      'example.com/some/long/...'
    );
    expect(smartTruncate('example.com/some/long/path/here', 20)).toBe(
      'example.com/some/...'
    );
  });
});

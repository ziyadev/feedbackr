import { truncate } from './truncate';

describe('truncate', () => {
  it('returns the string unchanged when under the limit', () => {
    expect(truncate('hi', 10)).toBe('hi');
  });

  it('returns the string unchanged when exactly at the limit', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  it('handles empty, null and undefined input', () => {
    expect(truncate('', 5)).toBe('');
    expect(truncate(null, 5)).toBeNull();
    expect(truncate(undefined, 5)).toBeNull();
  });

  it('appends an ellipsis within the limit', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
    expect(truncate('hello', 4)).toBe('h...');
  });

  it('never exceeds the limit for short lengths', () => {
    expect(truncate('hello', 3)?.length).toBeLessThanOrEqual(3);
    expect(truncate('hello', 2)?.length).toBeLessThanOrEqual(2);
    expect(truncate('hello', 1)?.length).toBeLessThanOrEqual(1);
  });

  it('returns the leading characters when there is no room for an ellipsis', () => {
    expect(truncate('hello', 2)).toBe('he');
    expect(truncate('hello', 3)).toBe('hel');
  });

  it('returns an empty string for a zero or negative limit', () => {
    expect(truncate('hello', 0)).toBe('');
    expect(truncate('hello', -1)).toBe('');
  });
});

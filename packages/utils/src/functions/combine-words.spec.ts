import { combineWords } from './combine-words';

describe('combineWords', () => {
  it('returns an empty string for an empty array', () => {
    expect(combineWords([])).toBe('');
  });

  it('returns a single word unchanged', () => {
    expect(combineWords(['apple'])).toBe('apple');
  });

  it('joins two words with "and"', () => {
    expect(combineWords(['apple', 'pear'])).toBe('apple and pear');
  });

  it('joins three or more words with commas and a final "and"', () => {
    expect(combineWords(['a', 'b', 'c'])).toBe('a, b and c');
    expect(combineWords(['a', 'b', 'c', 'd'])).toBe('a, b, c and d');
  });

  it('keeps empty strings as items', () => {
    expect(combineWords(['', ''])).toBe(' and ');
    expect(combineWords([''])).toBe('');
  });

  it('preserves whitespace inside words', () => {
    expect(combineWords([' a ', 'b c'])).toBe(' a  and b c');
  });

  it('puts "and" before the last word even if it contains a comma', () => {
    expect(combineWords(['a', 'b,c'])).toBe('a and b,c');
    expect(combineWords(['a', 'b', 'c, d'])).toBe('a, b and c, d');
  });
});

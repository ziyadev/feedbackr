import { stableSort } from './stable-sort';

const numeric = (a: number, b: number) => a - b;

describe('stableSort', () => {
  it('returns an empty array for an empty input', () => {
    expect(stableSort([], numeric)).toEqual([]);
  });

  it('returns a single element array unchanged', () => {
    expect(stableSort([1], numeric)).toEqual([1]);
  });

  it('sorts items using the compare function', () => {
    expect(stableSort([3, 1, 2], numeric)).toEqual([1, 2, 3]);
    expect(stableSort([3, 1, 2], (a, b) => b - a)).toEqual([3, 2, 1]);
  });

  it('does not mutate the input array', () => {
    const input = [3, 1, 2];
    stableSort(input, numeric);
    expect(input).toEqual([3, 1, 2]);
  });

  it('preserves original order of items with equal keys', () => {
    const items = [
      { k: 1, id: 'a' },
      { k: 0, id: 'b' },
      { k: 1, id: 'c' },
      { k: 0, id: 'd' },
      { k: 1, id: 'e' },
    ];
    expect(stableSort(items, (a, b) => a.k - b.k).map((i) => i.id)).toEqual([
      'b',
      'd',
      'a',
      'c',
      'e',
    ]);
  });

  it('keeps order for a large input where every key is equal', () => {
    const items = Array.from({ length: 1000 }, (_, id) => ({ id }));
    expect(stableSort(items, () => 0)).toEqual(items);
  });

  it('handles duplicate primitive values', () => {
    expect(stableSort([2, 1, 2, 1, 2], numeric)).toEqual([1, 1, 2, 2, 2]);
  });

  it('keeps object identity of items', () => {
    const a = { k: 1 };
    const b = { k: 1 };
    const [first, second] = stableSort([a, b], (x, y) => x.k - y.k);
    expect(first).toBe(a);
    expect(second).toBe(b);
  });

  it('sorts mixed types with a custom comparator', () => {
    const items: (string | number)[] = ['10', 9, '8', 11];
    expect(stableSort(items, (a, b) => Number(a) - Number(b))).toEqual([
      '8',
      9,
      '10',
      11,
    ]);
  });

  it('sorts strings with localeCompare', () => {
    expect(stableSort(['b', 'a', 'c'], (a, b) => a.localeCompare(b))).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('treats a NaN comparator result as equal, preserving order', () => {
    expect(stableSort([3, 1, 2], () => NaN)).toEqual([3, 1, 2]);
  });

  it('works with comparators that only return -1, 0 or 1', () => {
    const sign = (a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0);
    expect(stableSort([5, 3, 5, 1], sign)).toEqual([1, 3, 5, 5]);
  });

  it('does not call the comparator for empty or single element arrays', () => {
    const compare = jest.fn(numeric);
    stableSort([], compare);
    stableSort([1], compare);
    expect(compare).not.toHaveBeenCalled();
  });

  it('sorts an already sorted and a reverse sorted array', () => {
    expect(stableSort([1, 2, 3, 4], numeric)).toEqual([1, 2, 3, 4]);
    expect(stableSort([4, 3, 2, 1], numeric)).toEqual([1, 2, 3, 4]);
  });
});

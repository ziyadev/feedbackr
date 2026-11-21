import { chunk } from './chunk';

describe('chunk', () => {
  it('splits items into chunks of the given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns an empty array for an empty input', () => {
    expect(chunk([], 2)).toEqual([]);
  });

  it.each([0, -1])(
    'throws a RangeError instead of dropping items when chunk_size is %p',
    (size) => {
      expect(() => chunk([1, 2, 3], size)).toThrow(RangeError);
    }
  );
});

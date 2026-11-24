import { deepEqual } from './deep-equal';

describe('deepEqual', () => {
  it('compares primitives', () => {
    expect(deepEqual(1 as any, 1 as any)).toBe(true);
    expect(deepEqual(1 as any, 2 as any)).toBe(false);
    expect(deepEqual('a' as any, 'a' as any)).toBe(true);
    expect(deepEqual('1' as any, 1 as any)).toBe(false);
    expect(deepEqual(true as any, false as any)).toBe(false);
  });

  it('treats NaN as equal to NaN', () => {
    expect(deepEqual(NaN as any, NaN as any)).toBe(true);
    expect(deepEqual({ a: NaN }, { a: NaN })).toBe(true);
    expect(deepEqual(NaN as any, 0 as any)).toBe(false);
  });

  it('treats +0 and -0 as equal', () => {
    expect(deepEqual(0 as any, -0 as any)).toBe(true);
    expect(deepEqual({ a: 0 }, { a: -0 })).toBe(true);
  });

  it('distinguishes null from undefined', () => {
    expect(deepEqual(null as any, undefined as any)).toBe(false);
    expect(deepEqual({ a: null }, { a: undefined })).toBe(false);
    expect(deepEqual(null as any, null as any)).toBe(true);
    expect(deepEqual(undefined as any, undefined as any)).toBe(true);
  });

  it('compares nested objects and arrays', () => {
    expect(
      deepEqual({ a: { b: [1, { c: 2 }] } }, { a: { b: [1, { c: 2 }] } })
    ).toBe(true);
    expect(
      deepEqual({ a: { b: [1, { c: 2 }] } }, { a: { b: [1, { c: 3 }] } })
    ).toBe(false);
  });

  it('is sensitive to array order and length', () => {
    expect(deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(deepEqual([1, 2, 3], [3, 2, 1])).toBe(false);
    expect(deepEqual([1, 2], [1, 2, 3])).toBe(false);
  });

  it('ignores object key order', () => {
    expect(deepEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it('distinguishes a missing key from an undefined value', () => {
    expect(deepEqual({ a: 1, b: undefined }, { a: 1, c: undefined })).toBe(
      false
    );
    expect(deepEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });

  it('does not treat an array as equal to a plain object', () => {
    expect(deepEqual([1] as any, { 0: 1 })).toBe(false);
    expect(deepEqual([] as any, {})).toBe(false);
  });

  it('compares Dates by time value', () => {
    expect(deepEqual(new Date(1000) as any, new Date(1000) as any)).toBe(true);
    expect(deepEqual(new Date(1000) as any, new Date(2000) as any)).toBe(false);
    expect(deepEqual({ d: new Date(1) }, { d: new Date(2) })).toBe(false);
  });

  it('compares Sets', () => {
    expect(deepEqual(new Set([1, 2]) as any, new Set([2, 1]) as any)).toBe(
      true
    );
    expect(deepEqual(new Set([1, 2]) as any, new Set([1, 3]) as any)).toBe(
      false
    );
    expect(deepEqual(new Set([1]) as any, new Set([1, 2]) as any)).toBe(false);
  });

  it('compares Maps', () => {
    expect(
      deepEqual(
        new Map([['a', { x: 1 }]]) as any,
        new Map([['a', { x: 1 }]]) as any
      )
    ).toBe(true);
    expect(
      deepEqual(new Map([['a', 1]]) as any, new Map([['a', 2]]) as any)
    ).toBe(false);
    expect(
      deepEqual(new Map([['a', 1]]) as any, new Map([['b', 1]]) as any)
    ).toBe(false);
  });
});

import { clamp, clampInt } from './clamp';

describe('clamp', () => {
  it('returns the value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('returns the bounds when value equals them', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('works when min equals max', () => {
    expect(clamp(7, 3, 3)).toBe(3);
  });

  it('throws when min is greater than max', () => {
    expect(() => clamp(5, 10, 0)).toThrow(RangeError);
  });

  it('throws when a bound is NaN', () => {
    expect(() => clamp(5, NaN, 1)).toThrow(RangeError);
    expect(() => clamp(5, 1, NaN)).toThrow(RangeError);
  });
});

describe('clampInt', () => {
  it('rounds a value within range', () => {
    expect(clampInt(5.4, 0, 10)).toBe(5);
    expect(clampInt(5.5, 0, 10)).toBe(6);
  });

  it('clamps to the bounds', () => {
    expect(clampInt(-5.2, 0, 10)).toBe(0);
    expect(clampInt(15.7, 0, 10)).toBe(10);
  });

  it('throws when min is greater than max', () => {
    expect(() => clampInt(5, 10, 0)).toThrow(RangeError);
  });

  it('throws when a bound is NaN', () => {
    expect(() => clampInt(5, NaN, 1)).toThrow(RangeError);
    expect(() => clampInt(5, 1, NaN)).toThrow(RangeError);
  });
});

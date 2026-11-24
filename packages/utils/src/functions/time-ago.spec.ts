import { timeAgo } from './time-ago';

const NOW = new Date('2024-06-15T12:00:00Z');
const ago = (msAgo: number) => new Date(NOW.getTime() - msAgo);
const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('timeAgo', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns "Never" for null', () => {
    expect(timeAgo(null)).toBe('Never');
  });

  it('returns "Just now" for now and sub-second diffs', () => {
    expect(timeAgo(NOW)).toBe('Just now');
    expect(timeAgo(ago(999))).toBe('Just now');
  });

  it('returns "Just now" for future dates', () => {
    expect(timeAgo(new Date(NOW.getTime() + 5 * MIN))).toBe('Just now');
  });

  it('formats seconds', () => {
    expect(timeAgo(ago(30 * SEC))).toBe('30s');
  });

  it('formats minutes', () => {
    expect(timeAgo(ago(5 * MIN))).toBe('5m');
  });

  it('formats hours', () => {
    expect(timeAgo(ago(3 * HOUR))).toBe('3h');
  });

  it('appends "ago" when withAgo is set', () => {
    expect(timeAgo(ago(5 * MIN), { withAgo: true })).toBe('5m ago');
  });

  it('switches to a date after 23 hours', () => {
    expect(timeAgo(ago(22 * HOUR))).toBe('22h');
    expect(timeAgo(ago(2 * DAY))).toBe('Jun 13');
  });

  it('formats weeks and months without a year in the current year', () => {
    expect(timeAgo(ago(14 * DAY))).toBe('Jun 1');
    expect(timeAgo(ago(90 * DAY))).toBe('Mar 17');
  });

  it('includes the year for previous years', () => {
    expect(timeAgo(ago(365 * DAY))).toBe('Jun 16, 2023');
  });

  it('does not throw on an invalid date', () => {
    expect(timeAgo(new Date('invalid'))).toBe('Never');
  });
});

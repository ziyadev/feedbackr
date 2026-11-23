import { getSeedUserPassword } from './seed-env';

describe('getSeedUserPassword', () => {
  it('returns SEED_USER_PASSWORD when set', () => {
    expect(getSeedUserPassword({ SEED_USER_PASSWORD: 'abc' })).toBe('abc');
  });

  it('throws when unset or empty', () => {
    expect(() => getSeedUserPassword({})).toThrow('SEED_USER_PASSWORD');
    expect(() => getSeedUserPassword({ SEED_USER_PASSWORD: '' })).toThrow(
      'SEED_USER_PASSWORD'
    );
  });
});

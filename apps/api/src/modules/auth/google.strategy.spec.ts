import 'reflect-metadata';
import { GoogleStrategy } from './strategies/google.strategy';

jest.mock('@/common/config/env', () => ({}), { virtual: true });
jest.mock('@/modules/auth/auth.service', () => ({ AuthService: class {} }), {
  virtual: true,
});

const make = () => {
  const handleOAuthCallback = jest.fn().mockResolvedValue({});
  const config = { get: (k: string) => k };
  const strategy = new GoogleStrategy(
    config as any,
    { handleOAuthCallback } as any
  );
  return { strategy, handleOAuthCallback };
};
const profile = (verified: unknown) =>
  ({
    id: 'g1',
    displayName: 'U',
    emails: [{ value: 'me@x.c' }],
    photos: [{ value: 'x' }],
    _json: { email_verified: verified },
  } as any);

describe('GoogleStrategy', () => {
  it('builds the callback url from PUBLIC_BASE_APP_URL', () => {
    expect((make().strategy as any)._callbackURL).toBe(
      'PUBLIC_BASE_APP_URL/auth/google/callback'
    );
  });

  it('looks up/creates the user via handleOAuthCallback with the google provider', async () => {
    const { strategy, handleOAuthCallback } = make();
    const done = jest.fn();
    await strategy.validate('a', 'r', profile(true), done);
    expect(handleOAuthCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'me@x.c',
        emailVerified: true,
        provider: 'google',
        providerAccountId: 'g1',
      })
    );
    expect(done).toHaveBeenCalledWith(null, {});
  });

  it('is unverified unless Google says email_verified === true', async () => {
    const { strategy, handleOAuthCallback } = make();
    await strategy.validate('a', 'r', profile('true'), jest.fn());
    expect(handleOAuthCallback).toHaveBeenCalledWith(
      expect.objectContaining({ emailVerified: false })
    );
  });
});

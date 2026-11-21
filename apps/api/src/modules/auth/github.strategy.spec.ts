import 'reflect-metadata';
import { GithubStrategy } from './strategies/github.stategy';

jest.mock('@/common/config/env', () => ({}), { virtual: true });
jest.mock('@/modules/auth/auth.service', () => ({ AuthService: class {} }), {
  virtual: true,
});

const make = () => {
  const handleOAuthCallback = jest.fn().mockResolvedValue({});
  const config = { get: (k: string) => k };
  const strategy = new GithubStrategy(
    config as any,
    { handleOAuthCallback } as any
  );
  return { strategy, handleOAuthCallback };
};
const profile = (emails: any[]) =>
  ({ id: '1', username: 'u', emails, photos: [{ value: 'x' }] } as any);

describe('GithubStrategy', () => {
  it('asks passport-github2 for raw emails so verified/primary are mapped', () => {
    expect((make().strategy as any)._allRawEmails).toBe(true);
  });

  it('passes the verified flag of the primary email (allRawEmails shape)', async () => {
    const { strategy, handleOAuthCallback } = make();
    await strategy.validate(
      'a',
      'r',
      profile([
        { value: 'other@x.c', primary: false, verified: true },
        { value: 'me@x.c', primary: true, verified: true },
      ]),
      jest.fn()
    );
    expect(handleOAuthCallback).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'me@x.c', emailVerified: true })
    );
  });

  it('is unverified when the flag is missing (shape without allRawEmails)', async () => {
    const { strategy, handleOAuthCallback } = make();
    await strategy.validate(
      'a',
      'r',
      profile([{ value: 'me@x.c' }]),
      jest.fn()
    );
    expect(handleOAuthCallback).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'me@x.c', emailVerified: false })
    );
  });
});

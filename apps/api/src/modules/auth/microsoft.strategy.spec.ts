import 'reflect-metadata';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';

jest.mock('@/common/config/env', () => ({}), { virtual: true });
jest.mock('@/modules/auth/auth.service', () => ({ AuthService: class {} }), {
  virtual: true,
});

const make = (tenant = 'my-tenant-id') => {
  const handleOAuthCallback = jest.fn().mockResolvedValue({});
  const config = {
    get: (k: string) => (k === 'MICROSOFT_TENANT_ID' ? tenant : k),
  };
  const strategy = new MicrosoftStrategy(
    config as any,
    { handleOAuthCallback } as any
  );
  return { strategy, handleOAuthCallback };
};
const mockGraph = (body: any, ok = true) =>
  (global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: async () => body,
  }) as any);

describe('MicrosoftStrategy', () => {
  it('uses the tenant-specific v2 endpoints', () => {
    const { strategy } = make();
    expect((strategy as any)._oauth2._authorizeUrl).toContain(
      '/my-tenant-id/oauth2/v2.0/authorize'
    );
  });

  it('maps the Graph profile; mail is verified for a single tenant', async () => {
    mockGraph({ id: 'oid1', displayName: 'Me', mail: 'me@x.c' });
    const { strategy, handleOAuthCallback } = make();
    const done = jest.fn();
    await strategy.validate('a', 'r', {}, done);
    expect(handleOAuthCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'me@x.c',
        name: 'Me',
        emailVerified: true,
        provider: 'microsoft',
        providerAccountId: 'oid1',
      })
    );
  });

  it('does not trust the email for multi-tenant endpoints', async () => {
    mockGraph({ id: 'oid1', displayName: 'Me', mail: 'me@x.c' });
    const { strategy, handleOAuthCallback } = make('common');
    await strategy.validate('a', 'r', {}, jest.fn());
    expect(handleOAuthCallback).toHaveBeenCalledWith(
      expect.objectContaining({ emailVerified: false })
    );
  });

  it('treats multi-tenant values case-insensitively', async () => {
    mockGraph({ id: 'oid1', displayName: 'Me', mail: 'me@x.c' });
    const { strategy, handleOAuthCallback } = make('Common');
    await strategy.validate('a', 'r', {}, jest.fn());
    expect(handleOAuthCallback).toHaveBeenCalledWith(
      expect.objectContaining({ emailVerified: false })
    );
  });

  it('never falls back to the unverified userPrincipalName', async () => {
    mockGraph({ id: 'oid1', displayName: 'Me', userPrincipalName: 'u@x.c' });
    const { strategy, handleOAuthCallback } = make();
    await strategy.validate('a', 'r', {}, jest.fn());
    expect(handleOAuthCallback).toHaveBeenCalledWith(
      expect.objectContaining({ email: undefined, emailVerified: false })
    );
  });

  it('passes errors to done when Graph fails', async () => {
    mockGraph({}, false);
    const { strategy } = make();
    const done = jest.fn();
    await strategy.validate('a', 'r', {}, done);
    expect(done).toHaveBeenCalledWith(expect.any(Error));
  });
});

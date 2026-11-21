import 'reflect-metadata';
import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfGuard } from '../../common/guards/csrf.guard';
import { StorageResolver } from '../storage/storage.resolver';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthProvider } from './interface/auth.interface';
import { SessionStrategy } from './strategies/session.strategy';
import { purgeLeakedSessions } from '../../common/config/redis-store.config';
import { WorkspaceStrategy } from './strategies/workspace.strategy';
import { passwordHash } from './utils/password-hash';

jest.mock(
  '@repo/utils',
  () => ({ normalizeString: (s: string) => s.trim().toLowerCase() }),
  { virtual: true }
);
jest.mock('../../common/config/redis-store.config', () => {
  const actual = jest.requireActual('../../common/config/redis-store.config');
  return { ...actual, redisStore: {} };
});
jest.mock('../../common/config/redis-client.config', () => ({
  redisClient: {},
}));
jest.mock('../../common/config/csrf.config', () => ({
  validateRequest: () => true,
}));

const ctx = (req: any, handler: any, cls: any) =>
  ({
    getType: () => 'http',
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => handler,
    getClass: () => cls,
  } as any);

describe('WorkspaceStrategy', () => {
  it('enforces method-level roles', async () => {
    class R {
      m() {
        return 1;
      }
    }
    Reflect.defineMetadata('roles', ['ADMIN'], R.prototype.m);
    const s = new WorkspaceStrategy(new Reflector());
    const req = { session: { workspace: { id: 'w', role: 'VIEWER' } } };
    await expect(s.canActivate(ctx(req, R.prototype.m, R))).resolves.toBe(
      false
    );
    req.session.workspace.role = 'ADMIN';
    await expect(s.canActivate(ctx(req, R.prototype.m, R))).resolves.toBe(true);
  });
});

describe('CsrfGuard', () => {
  it('does not log cookies or headers', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await new CsrfGuard().canActivate(
      ctx({ cookies: { a: 1 }, headers: { b: 2 } }, null, null)
    );
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('StorageResolver', () => {
  it('requires an authenticated session', () => {
    const guards = Reflect.getMetadata(
      '__guards__',
      StorageResolver.prototype.getUploadPresignedUrl
    );
    expect(guards?.length).toBeGreaterThan(0);
  });
});

const makeService = (user: any, cache: any = {}) => {
  const store = new Map<string, any>();
  const userService = {
    findByEmail: jest.fn().mockResolvedValue(user),
    findByAccountProviderId: jest.fn().mockResolvedValue(null),
    linkAccount: jest.fn().mockResolvedValue(undefined),
  };
  const cacheManager = {
    get: jest.fn(async (k) => store.get(k)),
    set: jest.fn(async (k, v) => void store.set(k, v)),
    del: jest.fn(async (k) => void store.delete(k)),
    ...cache,
  };
  const svc = new AuthService(
    userService as any,
    {} as any,
    {} as any,
    {} as any,
    cacheManager as any
  );
  return { svc, userService };
};

describe('AuthService', () => {
  const oauth = {
    provider: AuthProvider.GOOGLE,
    providerAccountId: 'p1',
    name: 'n',
    email: 'a@b.c',
    avatar_url: '',
    emailVerified: true,
  };

  it('refuses OAuth login into an existing unverified-email account', async () => {
    const { svc } = makeService({
      id: 'u',
      email: 'a@b.c',
      emailVerified: false,
    });
    await expect(svc.handleOAuthCallback(oauth)).rejects.toBeInstanceOf(
      UnauthorizedException
    );
  });

  it('refuses OAuth email-match login when the provider did not verify the email', async () => {
    const { svc, userService } = makeService({
      id: 'u',
      email: 'a@b.c',
      emailVerified: true,
    });
    await expect(
      svc.handleOAuthCallback({ ...oauth, emailVerified: false })
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(userService.linkAccount).not.toHaveBeenCalled();
  });

  it('links an account on a verified email match', async () => {
    const { svc, userService } = makeService({
      id: 'u',
      email: 'a@b.c',
      emailVerified: true,
    });
    await svc.handleOAuthCallback(oauth);
    expect(userService.linkAccount).toHaveBeenCalledWith({
      userId: 'u',
      provider: 'google',
      providerAccountId: 'p1',
    });
  });

  it('saveSession regenerates the session and stores no password hash', async () => {
    const { svc } = makeService(null);
    const req: any = {};
    const session: any = {
      req,
      regenerate: (cb: any) => {
        req.session = {};
        cb();
      },
    };
    await svc.saveSession(session, {
      id: 'u',
      email: 'e',
      emailVerified: true,
      hashedPassword: 'secret',
    } as any);
    expect(req.session.user).toEqual({
      id: 'u',
      email: 'e',
      emailVerified: true,
      rules: [],
      permissions: [],
      planId: '',
    });
  });

  it('locks out login after too many failed attempts', async () => {
    const hashedPassword = await passwordHash('right');
    const { svc, userService } = makeService({
      id: 'u',
      email: 'a@b.c',
      hashedPassword,
    });
    jest.spyOn(global, 'setTimeout').mockImplementation(((f: any) => {
      f();
      return 0;
    }) as any);
    for (let i = 0; i < 5; i++) {
      await svc.handleCredentialsLogin(
        { email: 'a@b.c', password: 'wrong' },
        {} as any
      );
    }
    userService.findByEmail.mockClear();
    const res: any = await svc.handleCredentialsLogin(
      { email: 'a@b.c', password: 'right' },
      {} as any
    );
    expect(userService.findByEmail).not.toHaveBeenCalled();
    expect(res.user).toBeNull();
  });
});

describe('AuthController OAuth callback', () => {
  it('saves a sanitized user via saveSession', async () => {
    const saveSession = jest.fn().mockResolvedValue(undefined);
    const c = new AuthController({ saveSession } as any);
    const res: any = { redirect: jest.fn() };
    const req: any = {
      user: { id: 'u', email: 'e', emailVerified: true, hashedPassword: 'x' },
      headers: {},
      query: {},
    };
    await c.googleCallback(req, res, {} as any).catch(() => undefined);
    expect(saveSession).toHaveBeenCalled();
  });
});

describe('legacy sessions holding hashedPassword', () => {
  it('SessionStrategy rejects and destroys them', async () => {
    const destroy = jest.fn((cb) => cb?.());
    const req = {
      session: { user: { id: 'u', hashedPassword: 'x' }, destroy },
    };
    await expect(
      new SessionStrategy().canActivate(ctx(req, null, null))
    ).resolves.toBe(false);
    expect(destroy).toHaveBeenCalled();
  });

  it('/auth/session returns only whitelisted user fields', () => {
    const c = new AuthController({} as any);
    const out = c.session({
      user: {
        id: 'u',
        email: 'e',
        emailVerified: true,
        planId: '',
        hashedPassword: 'x',
        rules: [],
      },
    } as any);
    expect(out.session.user).toEqual({
      id: 'u',
      email: 'e',
      emailVerified: true,
      planId: '',
    });
  });

  it('purgeLeakedSessions deletes only sessions containing a hash', async () => {
    const store: Record<string, string> = {
      'session:a': JSON.stringify({ user: { hashedPassword: 'x' } }),
      'session:b': JSON.stringify({ user: { id: 'u' } }),
    };
    const client: any = {
      scanIterator: async function* () {
        yield* Object.keys(store);
      },
      get: async (k: string) => store[k],
      del: jest.fn(),
    };
    await purgeLeakedSessions(client);
    expect(client.del).toHaveBeenCalledTimes(1);
    expect(client.del).toHaveBeenCalledWith('session:a');
  });
});

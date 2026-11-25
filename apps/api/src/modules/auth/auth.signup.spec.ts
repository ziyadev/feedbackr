import 'reflect-metadata';
import { AuthService } from './auth.service';
import { AuthProvider } from './interface/auth.interface';

jest.mock(
  '@repo/utils',
  () => ({ normalizeString: (s: string) => s.trim().toLowerCase() }),
  { virtual: true }
);
jest.mock('../../common/config/redis-store.config', () => ({ redisStore: {} }));
jest.mock('../../common/config/redis-client.config', () => ({
  redisClient: {},
}));

const makeService = () => {
  const users: any[] = [];
  const add = (u: any) => {
    users.push({ id: String(users.length), ...u });
    return users[users.length - 1];
  };
  const userService = {
    findByEmail: jest.fn(async ({ email }) =>
      users.find((u) => u.email === email)
    ),
    findByAccountProviderId: jest.fn().mockResolvedValue(null),
    create: jest.fn(async (u) => add(u)),
    createWithProvider: jest.fn(async (u) => add(u)),
  };
  const svc: any = new AuthService(
    userService as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any
  );
  svc.saveSession = jest.fn().mockResolvedValue(undefined);
  return { svc, users, userService };
};

describe('mixed-case emails', () => {
  beforeEach(() => {
    jest.spyOn(global, 'setTimeout').mockImplementation(((fn: any) => {
      fn();
      return 0;
    }) as any);
  });
  afterEach(() => jest.restoreAllMocks());

  const dto = { name: 'Bob', password: 'Passw0rd!' } as any;

  it('credentials sign-up does not create two accounts', async () => {
    const { svc, users } = makeService();
    await svc.handleCredentialsSignUp({ ...dto, email: 'Bob@x.com' }, {});
    const second = await svc.handleCredentialsSignUp(
      { ...dto, email: 'bob@x.com' },
      {}
    );

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('bob@x.com');
    expect(second.user).toBeNull();
    expect(second.errors?.[0]?.message).toBe('User already exists');
  });

  it('returns the user-exists error when the unique index rejects a race', async () => {
    const { svc, userService } = makeService();
    userService.create.mockRejectedValueOnce({ code: 'P2002' });
    const res = await svc.handleCredentialsSignUp(
      { ...dto, email: 'Bob@x.com' },
      {}
    );
    expect(res.user).toBeNull();
    expect(res.errors?.[0]?.message).toBe('User already exists');
  });

  it('OAuth sign-up stores the normalized email and reuses the account', async () => {
    const { svc, users } = makeService();
    const oauth = {
      provider: AuthProvider.GOOGLE,
      providerAccountId: 'g1',
      name: 'Bob',
      emailVerified: true,
    };
    await svc.handleOAuthCallback({ ...oauth, email: 'Bob@x.com' });
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('bob@x.com');

    await svc.handleCredentialsSignUp({ ...dto, email: 'BOB@x.com' }, {});
    expect(users).toHaveLength(1);
  });
});

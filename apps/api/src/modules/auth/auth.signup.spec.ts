import 'reflect-metadata';
import { AuthService } from './auth.service';

jest.mock(
  '@repo/utils',
  () => ({ normalizeString: (s: string) => s.trim().toLowerCase() }),
  { virtual: true }
);
jest.mock('../../common/config/redis-store.config', () => ({ redisStore: {} }));
jest.mock('../../common/config/redis-client.config', () => ({
  redisClient: {},
}));

describe('AuthService.handleCredentialsSignUp', () => {
  it('does not create two accounts for mixed-case emails', async () => {
    const users: any[] = [];
    const userService = {
      findByEmail: jest.fn(async ({ email }) =>
        users.find((u) => u.email === email)
      ),
      create: jest.fn(async (u) => {
        users.push({ id: String(users.length), ...u });
        return users[users.length - 1];
      }),
    };
    const svc: any = new AuthService(
      userService as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any
    );
    svc.saveSession = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(global, 'setTimeout').mockImplementation(((fn: any) => {
      fn();
      return 0;
    }) as any);

    const dto = { name: 'Bob', password: 'Passw0rd!' } as any;
    await svc.handleCredentialsSignUp({ ...dto, email: 'Bob@x.com' }, {});
    await svc.handleCredentialsSignUp({ ...dto, email: 'bob@x.com' }, {});

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('bob@x.com');
  });
});

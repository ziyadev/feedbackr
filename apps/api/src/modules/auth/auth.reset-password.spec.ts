import 'reflect-metadata';
import { AuthService } from './auth.service';
import { TokenService } from '../token/token.service';

jest.mock(
  '@repo/utils',
  () => ({ normalizeString: (s: string) => s.trim().toLowerCase() }),
  { virtual: true }
);
jest.mock('./utils/password-hash', () => ({
  passwordHash: jest.fn(async (p: string) => `hashed:${p}`),
}));

type Row = { identifier: string; token: string; expires: Date; type: string };

const setup = () => {
  const rows: Row[] = [];
  const matches = (r: Row, w: any) =>
    Object.entries(w).every(([k, v]) => (r as any)[k] === v);
  const repo = {
    create: jest.fn(
      async ({ data }: any) =>
        void rows.push({ type: 'RESET_PASSWORD', ...data })
    ),
    findFirst: jest.fn(
      async ({ where }: any) => rows.find((r) => matches(r, where)) ?? null
    ),
    deleteMany: jest.fn(async ({ where }: any) => {
      let count = 0;
      for (let i = rows.length - 1; i >= 0; i--) {
        if (matches(rows[i], where)) {
          rows.splice(i, 1);
          count++;
        }
      }
      return { count };
    }),
  };
  const tokenService = new TokenService(repo as any);
  const userService = {
    findById: jest.fn().mockResolvedValue({ id: 'u1' }),
    update: jest.fn().mockResolvedValue(undefined),
  };
  const svc = new AuthService(
    userService as any,
    {} as any,
    tokenService,
    {} as any,
    {} as any
  );
  return { svc, tokenService, userService, rows };
};

describe('AuthService.handlechangePassword', () => {
  it('changes the password with a valid reset token', async () => {
    const { svc, tokenService, userService } = setup();
    const token = await tokenService.userResetPasswordToken.generate('u1');
    await expect(
      svc.handlechangePassword({ token, newPassword: 'new' } as any)
    ).resolves.toBe(true);
    expect(userService.update).toHaveBeenCalledWith('u1', {
      hashedPassword: 'hashed:new',
    });
  });

  it('rejects an expired token', async () => {
    const { svc, rows, userService } = setup();
    rows.push({
      identifier: 'u1',
      token: 't',
      expires: new Date(Date.now() - 1000),
      type: 'RESET_PASSWORD',
    });
    await expect(
      svc.handlechangePassword({ token: 't', newPassword: 'new' } as any)
    ).resolves.toBe(false);
    expect(userService.update).not.toHaveBeenCalled();
  });

  it('rejects replay of an already-used token', async () => {
    const { svc, tokenService, userService } = setup();
    const token = await tokenService.userResetPasswordToken.generate('u1');
    await svc.handlechangePassword({ token, newPassword: 'one' } as any);
    await expect(
      svc.handlechangePassword({ token, newPassword: 'two' } as any)
    ).resolves.toBe(false);
    expect(userService.update).toHaveBeenCalledTimes(1);
  });

  it('rejects a login-type token', async () => {
    const { svc, tokenService, userService } = setup();
    const token = await tokenService.userLoginToken.generate('u1');
    await expect(
      svc.handlechangePassword({ token, newPassword: 'new' } as any)
    ).resolves.toBe(false);
    expect(userService.update).not.toHaveBeenCalled();
  });
});

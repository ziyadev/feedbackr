import { R2Strategy } from './r2.strategy';

describe('R2Strategy credentials', () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it('throws a clear error when credentials are missing', () => {
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    expect(() => new R2Strategy()).toThrow(
      /R2_ACCESS_KEY_ID.*R2_SECRET_ACCESS_KEY/
    );
  });

  it('constructs when credentials are provided via env', () => {
    process.env.R2_ACCESS_KEY_ID = 'test-id';
    process.env.R2_SECRET_ACCESS_KEY = 'test-secret';
    expect(() => new R2Strategy()).not.toThrow();
  });
});

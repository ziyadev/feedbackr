import { hashStringSHA256 } from './hash-string';

describe('hashStringSHA256', () => {
  it('hashes a normal string', async () => {
    expect(await hashStringSHA256('hello')).toBe(
      '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
    );
  });

  it('hashes the empty string', async () => {
    expect(await hashStringSHA256('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('hashes unicode as UTF-8', async () => {
    expect(await hashStringSHA256('é')).toBe(
      '4a99557e4033c3539de2eb65472017cad5f9557f7a0625a09f1c3f6e2ba69c4c',
    );
  });

  it('is deterministic and always 64 lowercase hex chars', async () => {
    const a = await hashStringSHA256('feedbackr 🚀');
    expect(a).toBe(await hashStringSHA256('feedbackr 🚀'));
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is case and whitespace sensitive', async () => {
    expect(await hashStringSHA256('a')).not.toBe(await hashStringSHA256('A'));
    expect(await hashStringSHA256('a')).not.toBe(await hashStringSHA256('a '));
  });

  it('zero-pads bytes below 0x10', async () => {
    // Many inputs; every digest must stay 64 chars despite small bytes
    for (let i = 0; i < 200; i++) {
      expect(await hashStringSHA256(String(i))).toHaveLength(64);
    }
  });
});

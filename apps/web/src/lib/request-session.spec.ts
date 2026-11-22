import { memoizeByRequest } from './request-session';

describe('memoizeByRequest', () => {
  it('fetches once per request and shares the result', async () => {
    const fetcher = jest.fn().mockResolvedValue({ user: { id: '1' } });
    const req = {};
    const [a, b] = await Promise.all([
      memoizeByRequest(req, fetcher),
      memoizeByRequest(req, fetcher),
    ]);
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
  });

  it('does not share sessions across requests', async () => {
    const fetcher = jest.fn().mockResolvedValue(null);
    await memoizeByRequest({}, fetcher);
    await memoizeByRequest({}, fetcher);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

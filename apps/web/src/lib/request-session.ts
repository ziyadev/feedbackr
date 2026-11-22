// Request-scoped memoization: the WeakMap is keyed by the request object, so
// nothing outlives the request and sessions are never shared across cookies.
const cache = new WeakMap<object, Promise<unknown>>();

export const memoizeByRequest = <T>(
  request: object,
  fetcher: () => Promise<T>
): Promise<T> => {
  let hit = cache.get(request) as Promise<T> | undefined;
  if (!hit) {
    hit = fetcher();
    cache.set(request, hit);
  }
  return hit;
};

import { RedisStore } from 'connect-redis';
import { redisClient } from './redis-client.config';

export const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'session:',
});

/** delete stored sessions that still contain a password hash (pre-fix OAuth sessions) */
export async function purgeLeakedSessions(client: {
  scanIterator(o: { MATCH: string }): AsyncIterable<string>;
  get(k: string): Promise<string | null>;
  del(k: string): Promise<unknown>;
}) {
  for await (const key of client.scanIterator({ MATCH: 'session:*' })) {
    const raw = await client.get(key);
    if (raw?.includes('"hashedPassword"')) await client.del(key);
  }
}

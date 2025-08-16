import { createClient } from 'redis';

let redis;

export async function getRedisClient() {
  if (!redis) {
    redis = createClient({ url: process.env.REDIS_URL });
    redis.on('error', (err) => console.error('Redis Client Error', err));
    await redis.connect();
  }
  return redis;
}

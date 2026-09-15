import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: Redis | null = null;
let isRedisConnected = false;

// In-memory fallback cache
const memoryCache = new Map<string, { value: string; expiry: number }>();

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Don't hang if offline
    connectTimeout: 2000,
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    console.log('Connected to Redis Cache successfully.');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    // Log once as warning, avoid flooding
  });
} catch (e) {
  isRedisConnected = false;
}

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    if (isRedisConnected && redisClient) {
      try {
        const data = await redisClient.get(key);
        if (data) {
          return JSON.parse(data) as T;
        }
      } catch (err) {
        // fallback to memory
      }
    }

    const memItem = memoryCache.get(key);
    if (memItem) {
      if (Date.now() > memItem.expiry) {
        memoryCache.delete(key);
        return null;
      }
      return JSON.parse(memItem.value) as T;
    }

    return null;
  },

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    const stringValue = JSON.stringify(value);

    if (isRedisConnected && redisClient) {
      try {
        await redisClient.setex(key, ttlSeconds, stringValue);
        return;
      } catch (err) {
        // fallback to memory
      }
    }

    memoryCache.set(key, {
      value: stringValue,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  },

  async del(key: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        await redisClient.del(key);
      } catch (err) {
        // Ignore
      }
    }
    memoryCache.delete(key);
  },

  async invalidatePrefix(prefix: string): Promise<void> {
    if (isRedisConnected && redisClient) {
      try {
        const keys = await redisClient.keys(`${prefix}*`);
        if (keys.length > 0) {
          await redisClient.del(...keys);
        }
      } catch (err) {
        // Ignore
      }
    }

    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        memoryCache.delete(key);
      }
    }
  },

  isAvailable(): boolean {
    return isRedisConnected;
  },
};

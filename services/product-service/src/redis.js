const Redis = require('ioredis');

const client = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
  lazyConnect: true,
  enableOfflineQueue: false, // drop commands instead of queueing when disconnected
});

client.on('connect', () => console.log('Connected to Redis'));
client.on('error', (err) => console.error('Redis connection failed:', err.message));

// Connect but never crash the process on failure
client.connect().catch(() => {});

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getCache(key) {
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // treat Redis errors as cache misses
  }
}

async function setCache(key, data, ttlSeconds = 300) {
  try {
    await client.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  } catch {
    // caching is optional — swallow errors silently
  }
}

async function deleteCache(key) {
  try {
    await client.del(key);
  } catch {}
}

async function deleteCacheByPattern(pattern) {
  try {
    // SCAN is non-blocking unlike KEYS — safe for production
    let cursor = '0';
    do {
      const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length) await client.del(...keys);
    } while (cursor !== '0');
  } catch {}
}

module.exports = { getCache, setCache, deleteCache, deleteCacheByPattern };

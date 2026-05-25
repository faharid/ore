import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 });

export function cacheMiddleware(req, res, next) {
  if (req.method !== 'GET') return next();

  const key = `${req.workspace || 'default'}:${req.method}:${req.originalUrl}`;
  const cached = cache.get(key);
  if (cached) {
    return res.json(cached);
  }

  const originalJson = res.json.bind(res);
  res.json = (data) => {
    cache.set(key, data);
    return originalJson(data);
  };
  next();
}

export function invalidateCache(pattern) {
  const keys = cache.keys();
  for (const key of keys) {
    if (key.includes(pattern)) cache.del(key);
  }
}

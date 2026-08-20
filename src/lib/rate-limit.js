// src/lib/rate-limit.js
// Rate limiting básico en memoria (por instancia del proceso).
// No sustituye un limitador distribuido (Redis/Upstash), pero corta
// abuso obvio (spam de pedidos, fuerza bruta) en un solo servidor.

const buckets = new Map();

export function getClientIp(req) {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

// Devuelve { ok, retryAfterSeconds } y registra el intento si ok.
export function rateLimit(key, { limit = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();

  // Limpieza oportunista para no acumular buckets vencidos indefinidamente.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now > b.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { ok: true };
}

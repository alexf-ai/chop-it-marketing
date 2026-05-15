// app/api/revalidate/route.ts
//
// Webhook entry point invoked by Supabase whenever a recipes_published row
// changes (configured on the Supabase side — see README "SEO revalidation
// webhook"). Idempotent: replays are safe.
//
// Body shape:
//   { secret: string; slug?: string; paths?: string[] }
//
// Auth: shared secret in body, compared in constant time. The webhook can't
// add custom headers in some Supabase plans, hence body-as-auth.
//
// Rate limit: in-memory sliding bucket, 100 requests / minute / IP. Fine
// for low-volume webhooks; if we ever expose this beyond Supabase we'd
// swap to Vercel Firewall rules or @upstash/ratelimit.

import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function rateLimitCheck(ip: string): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt <= now) {
    const fresh = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    buckets.set(ip, fresh);
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetAt: fresh.resetAt };
  }
  bucket.count += 1;
  return {
    ok: bucket.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - bucket.count),
    resetAt: bucket.resetAt,
  };
}

// Drop stale buckets opportunistically (every ~100 hits) so the map doesn't
// grow unbounded across long-lived function instances under Fluid Compute.
function maybeGC() {
  if (buckets.size <= 256) return;
  const now = Date.now();
  for (const [ip, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(ip);
  }
}

function safeEqual(a: string, b: string): boolean {
  // Constant-time-ish string compare — guards against trivial timing oracles
  // on the secret. Length mismatch short-circuits but secret length is fixed
  // server-side so this leaks nothing useful.
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: Request) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'revalidation not configured' },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  const rl = rateLimitCheck(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'rate limited' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.max(1, Math.ceil((rl.resetAt - Date.now()) / 1000))),
        },
      },
    );
  }
  maybeGC();

  let body: { secret?: unknown; slug?: unknown; paths?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  if (typeof body?.secret !== 'string' || !safeEqual(body.secret, secret)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const slug = typeof body.slug === 'string' && body.slug.length > 0 ? body.slug : null;
  const extraPaths = Array.isArray(body.paths)
    ? body.paths.filter((p): p is string => typeof p === 'string' && p.startsWith('/'))
    : [];

  if (slug) revalidatePath(`/recipes/${slug}`);
  revalidatePath('/recipes');
  revalidatePath('/sitemap.xml');
  for (const p of extraPaths) revalidatePath(p);

  return NextResponse.json({
    revalidated: true,
    slug,
    extraPaths,
    ts: Date.now(),
  });
}

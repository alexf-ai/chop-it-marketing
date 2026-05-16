'use client';

// Social-proof counter shown below the hero waitlist form.
//
// Reads `total` from the public marketing_waitlist_count VIEW via the
// Supabase REST API using the anon key. View definition filters out
// unsubscribed rows; base table is RLS-locked so no PII leaks.
//
// Renders nothing below COUNTER_MIN_DISPLAY (currently 200). 5-minute
// sessionStorage cache so it doesn't re-fetch on every internal nav.

import { useEffect, useState } from 'react';

import {
  COUNTER_CACHE_KEY,
  COUNTER_CACHE_MS,
  COUNTER_MIN_DISPLAY,
  WAITLIST_COUNT_URL,
} from '@/lib/waitlist';

const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type Cached = { total: number; fetched_at: number };

function readCache(): number | null {
  try {
    const raw = sessionStorage.getItem(COUNTER_CACHE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Cached;
    if (Date.now() - c.fetched_at > COUNTER_CACHE_MS) return null;
    if (typeof c.total !== 'number') return null;
    return c.total;
  } catch {
    return null;
  }
}

function writeCache(total: number): void {
  try {
    const c: Cached = { total, fetched_at: Date.now() };
    sessionStorage.setItem(COUNTER_CACHE_KEY, JSON.stringify(c));
  } catch {
    /* sessionStorage can throw in privacy mode — silent fallback */
  }
}

export default function WaitlistCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    if (!ANON_KEY) return;
    const cached = readCache();
    if (cached != null) {
      setTotal(cached);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(WAITLIST_COUNT_URL, {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${ANON_KEY}`,
            // Force the row format so we always get an array even with
            // single results.
            Accept: 'application/json',
          },
        });
        if (!res.ok) return;
        const data = (await res.json()) as Array<{ total: number }>;
        if (cancelled) return;
        const t = Array.isArray(data) && data[0] ? data[0].total : 0;
        if (typeof t === 'number') {
          setTotal(t);
          writeCache(t);
        }
      } catch {
        /* ignore — counter is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (total == null || total < COUNTER_MIN_DISPLAY) return null;

  return (
    <p className="waitlist-counter mono" aria-live="off">
      Join {total.toLocaleString()}+ home cooks already signed up
    </p>
  );
}

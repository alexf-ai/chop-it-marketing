// Edge Function: GET /functions/v1/waitlist-unsubscribe?email=<urlencoded>&t=<sig>
//
// Marks the matching row as unsubscribed. Always returns the same plain
// HTML success page — never confirms or denies whether the email was on
// the list (anti-enumeration).
//
// `t` is an HMAC-SHA256(email_normalized) base64url signature generated
// by waitlist-submit with WAITLIST_UNSUBSCRIBE_SECRET. Without a valid
// signature, the function still returns the same HTML page but performs
// no DB write — so a third party who guesses an email can't unsubscribe
// somebody else.
//
// Invoked from the link in the Resend confirmation email, so it must:
//  - Be a GET (so it works from any email client's preview-then-click)
//  - Return HTML directly (the user opens this URL in a browser)
//  - Not require any auth headers

// @ts-expect-error — Deno globals
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-expect-error — Deno std http
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

declare const Deno: { env: { get(name: string): string | undefined } };

const SUCCESS_HTML = `<!DOCTYPE html>
<html lang="en-GB"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unsubscribed · Chop it</title>
  <meta name="robots" content="noindex">
</head><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 40px auto; padding: 0 20px; text-align: center; color: #111;">
  <h1 style="font-size: 24px;">You've been removed.</h1>
  <p>You won't hear from us again. If this was a mistake, <a href="https://chop-it.com/">rejoin the waitlist</a>.</p>
</body></html>`;

function htmlResponse(): Response {
  return new Response(SUCCESS_HTML, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Same page for everyone — fine to cache briefly at the edge.
      'cache-control': 'public, max-age=300',
    },
  });
}

// HMAC-SHA256(email_normalized) using WAITLIST_UNSUBSCRIBE_SECRET. Same
// algorithm as waitlist-submit; both must use the same secret.
async function expectedToken(emailNormalized: string): Promise<string | null> {
  const secret = Deno.env.get('WAITLIST_UNSUBSCRIBE_SECRET');
  if (!secret) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(emailNormalized));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Constant-time string comparison — defends against timing attacks on
// the signature check. Lengths are short and the function isn't latency-
// critical, so any side-channel signal is dominated by network jitter,
// but cheap to do correctly.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

serve(async (req: Request) => {
  // Always return the same page so this endpoint can't be used to probe
  // whether an email is on the list. We still do the DB write when the
  // input parses AND the signature checks out; otherwise we silently
  // skip the write.
  if (req.method !== 'GET') {
    return htmlResponse();
  }

  const url = new URL(req.url);
  const raw = url.searchParams.get('email');
  const token = url.searchParams.get('t');
  if (!raw || !token) return htmlResponse();

  const normalized = raw.trim().toLowerCase();
  if (!normalized || normalized.length > 320) return htmlResponse();
  if (token.length > 128) return htmlResponse();

  const expected = await expectedToken(normalized);
  if (!expected) {
    // Secret unset → fail closed. No emails should have gone out without
    // a working signature, but if we get a request, never act on it.
    console.error(
      '[waitlist-unsubscribe] WAITLIST_UNSUBSCRIBE_SECRET unset — refusing to process',
    );
    return htmlResponse();
  }
  if (!timingSafeEqual(token, expected)) {
    // Invalid signature — could be an attacker probing, could be a
    // mangled link. Log at warn-level so it's visible but doesn't
    // page anyone.
    console.warn('[waitlist-unsubscribe] invalid signature');
    return htmlResponse();
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    console.error('[waitlist-unsubscribe] Supabase env missing');
    return htmlResponse();
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  try {
    const { error } = await supabase
      .from('marketing_waitlist')
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq('email_normalized', normalized)
      .is('unsubscribed_at', null);
    if (error) {
      console.error('[waitlist-unsubscribe] update error', error);
    }
  } catch (err) {
    console.error('[waitlist-unsubscribe] update threw', err);
  }

  return htmlResponse();
});

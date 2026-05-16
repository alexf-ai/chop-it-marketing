// Edge Function: POST /functions/v1/waitlist-submit
//
// Accepts an email submission from the chop-it.com waitlist form, verifies
// the Cloudflare Turnstile token (when configured), upserts into
// marketing_waitlist, and best-effort fires a Resend confirmation email
// (when configured).
//
// Both Turnstile and Resend are env-gated: if their secrets are absent,
// the function still serves the happy path but skips that step. This lets
// us ship the table + form before the external accounts are provisioned.
//
// The function is invoked anonymously (no Supabase JWT). CORS allows the
// production hostnames. All non-validation errors return 500 with a
// generic body so we never leak internals to the client.

// @ts-expect-error — Deno globals are available in Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-expect-error — Deno std http
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

declare const Deno: { env: { get(name: string): string | undefined } };

const ALLOWED_ORIGINS = new Set([
  'https://chop-it.com',
  'https://www.chop-it.com',
  // Allow local dev too — Next.js dev server.
  'http://localhost:3000',
  'http://localhost:3001',
]);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type Body = {
  email?: unknown;
  turnstile_token?: unknown;
  posthog_distinct_id?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_term?: unknown;
  utm_content?: unknown;
  referrer?: unknown;
  landing_path?: unknown;
};

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://chop-it.com';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, x-client-info, apikey, authorization',
    Vary: 'Origin',
  };
}

function jsonResponse(
  body: object,
  init: { status?: number; origin: string | null },
): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'content-type': 'application/json',
      ...corsHeaders(init.origin),
    },
  });
}

function pickString(v: unknown, max = 512): string | null {
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

async function verifyTurnstile(token: string, remoteIp: string | null): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET');
  if (!secret) {
    // No secret configured → skip verification. Log so it's visible in
    // function logs that we're running unprotected.
    console.warn('[waitlist-submit] TURNSTILE_SECRET unset — skipping verification');
    return true;
  }
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (remoteIp) form.append('remoteip', remoteIp);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error('[waitlist-submit] turnstile fetch failed', err);
    return false;
  }
}

async function sendConfirmationEmail(email: string): Promise<void> {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) {
    console.warn('[waitlist-submit] RESEND_API_KEY unset — skipping confirmation email');
    return;
  }
  const unsubscribeUrl = `https://elirehiikubpbfyjzwky.supabase.co/functions/v1/waitlist-unsubscribe?email=${encodeURIComponent(email)}`;
  const html = `<!DOCTYPE html>
<html><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 40px auto; padding: 0 20px; color: #111;">
  <h1 style="font-size: 24px; margin: 0 0 16px;">You're in.</h1>
  <p>Thanks for joining the Chop it waitlist. We're building a meal-planning app that helps you eat a wider variety of food across the week — without overthinking it.</p>
  <p>You'll be one of the first to know when we launch on the App Store. We don't send marketing emails in the meantime.</p>
  <p>— The Chop it team</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;">
  <p style="font-size: 12px; color: #888;">You received this because you signed up at chop-it.com. Not you? <a href="${unsubscribeUrl}">Unsubscribe</a>.</p>
</body></html>`;
  const text = `You're in.

Thanks for joining the Chop it waitlist. We're building a meal-planning app that helps you eat a wider variety of food across the week — without overthinking it.

You'll be one of the first to know when we launch on the App Store. We don't send marketing emails in the meantime.

— The Chop it team

Unsubscribe: ${unsubscribeUrl}`;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Chop it <hello@chop-it.com>',
        to: email,
        subject: `You're on the Chop it waitlist`,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[waitlist-submit] Resend ${res.status}: ${body}`);
    }
  } catch (err) {
    console.error('[waitlist-submit] Resend fetch failed', err);
  }
}

serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'method_not_allowed' }, { status: 405, origin });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return jsonResponse({ ok: false, error: 'invalid_json' }, { status: 400, origin });
  }

  const email = pickString(body.email, 320);
  if (!email || !EMAIL_RE.test(email)) {
    return jsonResponse(
      { ok: false, error: 'invalid_email' },
      { status: 400, origin },
    );
  }

  // Turnstile token is required when the function has a TURNSTILE_SECRET
  // configured. With no secret set (env-gated), token may be absent and
  // verifyTurnstile() short-circuits to true.
  const turnstileToken = pickString(body.turnstile_token, 4096) ?? '';
  const remoteIp =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;
  const ok = await verifyTurnstile(turnstileToken, remoteIp);
  if (!ok) {
    return jsonResponse(
      { ok: false, error: 'turnstile_failed' },
      { status: 400, origin },
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    console.error('[waitlist-submit] Supabase env missing');
    return jsonResponse(
      { ok: false, error: 'submission_failed' },
      { status: 500, origin },
    );
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const row = {
    email,
    posthog_distinct_id: pickString(body.posthog_distinct_id, 128),
    utm_source: pickString(body.utm_source, 128),
    utm_medium: pickString(body.utm_medium, 128),
    utm_campaign: pickString(body.utm_campaign, 128),
    utm_term: pickString(body.utm_term, 128),
    utm_content: pickString(body.utm_content, 128),
    referrer: pickString(body.referrer, 2048),
    landing_path: pickString(body.landing_path, 1024),
    user_agent: pickString(req.headers.get('user-agent'), 1024),
    // Vercel/Cloudflare populate cf-ipcountry — fall back to header
    // variants we sometimes see.
    ip_country:
      pickString(req.headers.get('cf-ipcountry'), 8) ??
      pickString(req.headers.get('x-vercel-ip-country'), 8),
  };

  // Upsert: insert-on-conflict-do-nothing. We use the xmax trick to
  // distinguish "newly inserted" from "already existed":
  //   xmax = 0 → row was just inserted by this statement
  //   xmax != 0 → conflict, existing row (DO NOTHING applies)
  //
  // The Supabase REST client can't read xmax directly, so we do two
  // queries: one INSERT-IGNORE via upsert(), then a SELECT to know if
  // the row's created_at matches "just now". That's brittle. Simpler:
  // try INSERT, on conflict do a SELECT to confirm existence.
  const { error: insertErr } = await supabase
    .from('marketing_waitlist')
    .insert(row);

  let alreadySubscribed = false;
  let isNew = false;

  if (insertErr) {
    // 23505 = unique_violation — caught the duplicate.
    // 'code' is on PostgrestError; the JS client surfaces it.
    if ((insertErr as { code?: string }).code === '23505') {
      alreadySubscribed = true;
    } else {
      console.error('[waitlist-submit] insert error', insertErr);
      return jsonResponse(
        { ok: false, error: 'submission_failed' },
        { status: 500, origin },
      );
    }
  } else {
    isNew = true;
  }

  if (isNew) {
    // Fire-and-forget. Confirmation email is best-effort; if Resend fails
    // we still tell the user they're on the list (the row IS saved).
    sendConfirmationEmail(email).catch((err) =>
      console.error('[waitlist-submit] confirmation email failed', err),
    );
  }

  return jsonResponse(
    { ok: true, already_subscribed: alreadySubscribed },
    { status: 200, origin },
  );
});

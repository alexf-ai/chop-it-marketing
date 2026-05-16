// Edge Function: GET /functions/v1/waitlist-unsubscribe?email=<urlencoded>
//
// Marks the matching row as unsubscribed. Always returns the same plain
// HTML success page — never confirms or denies whether the email was on
// the list (anti-enumeration).
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

serve(async (req: Request) => {
  // Always return the same page so this endpoint can't be used to probe
  // whether an email is on the list. We still do the DB write when the
  // input parses; failures are logged but invisible to the caller.
  if (req.method !== 'GET') {
    return htmlResponse();
  }

  const url = new URL(req.url);
  const raw = url.searchParams.get('email');
  if (!raw) return htmlResponse();

  const normalized = raw.trim().toLowerCase();
  if (!normalized || normalized.length > 320) return htmlResponse();

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

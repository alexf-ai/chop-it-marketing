# Waitlist — how the pre-launch email signup works

The chop-it.com homepage hero and a sticky footer bar both collect emails
into the **`public.marketing_waitlist`** table on Supabase project
`elirehiikubpbfyjzwky`. Confirmation emails go via Resend, anti-bot is
Cloudflare Turnstile. Both external integrations are env-gated and the
function works without them (degrades cleanly — no email sent / no
Turnstile check).

## Architecture

```
[Browser]
   │  POST { email, turnstile_token, posthog_distinct_id, utm_*, ... }
   ▼
[Edge Function: waitlist-submit]
   ├─ Verify Turnstile (only if TURNSTILE_SECRET set)
   ├─ INSERT into marketing_waitlist (service-role client)
   ├─ Resend best-effort (only if RESEND_API_KEY set)
   └─ Respond { ok, already_subscribed }

[Browser, email "Unsubscribe" link]
   │  GET /functions/v1/waitlist-unsubscribe?email=...
   ▼
[Edge Function: waitlist-unsubscribe]
   └─ UPDATE marketing_waitlist SET unsubscribed_at = now()
      WHERE email_normalized = lower(trim(?))
```

## File map

| Path | Role |
|---|---|
| `supabase/migrations/20260516_marketing_waitlist.sql` | Table + unique index + RLS + public view |
| `supabase/functions/waitlist-submit/index.ts` | POST endpoint |
| `supabase/functions/waitlist-unsubscribe/index.ts` | GET endpoint (returns HTML) |
| `supabase/config.toml` | `verify_jwt = false` for both functions |
| `lib/waitlist.ts` | Shared regex + URLs + types |
| `lib/posthog-events.ts` | `trackWaitlistSubmitAttempted` / `Succeeded` / `Failed` / `StickyShown` / `StickyDismissed` |
| `app/components/WaitlistForm.tsx` | Hero + sticky form |
| `app/components/WaitlistCounter.tsx` | Social-proof counter |
| `app/components/WaitlistStickyBar.tsx` | Bottom-anchored bar |

## Apply the migration

```sql
-- Paste the contents of supabase/migrations/20260516_marketing_waitlist.sql
-- into Supabase Dashboard → SQL Editor → Run.
```

Or, with the Supabase CLI linked:

```bash
supabase link --project-ref elirehiikubpbfyjzwky
supabase db push
```

## Deploy the Edge Functions

```bash
# One-time
supabase link --project-ref elirehiikubpbfyjzwky

# Deploy both functions
supabase functions deploy waitlist-submit
supabase functions deploy waitlist-unsubscribe
```

## Required secrets (Supabase Dashboard → Edge Functions → Secrets)

| Secret | When required | How to get |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | always (auto-injected) | n/a |
| `SUPABASE_URL` | always (auto-injected) | n/a |
| `TURNSTILE_SECRET` | only when Turnstile is enabled | Cloudflare dashboard → Turnstile → your site |
| `RESEND_API_KEY` | only when confirmation emails are enabled | resend.com → API keys |

If a secret is unset, the function skips that step and logs a warning.
The signup still completes.

## Required Vercel env vars

Marketing site:

| Var | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | production + preview | Cloudflare → Turnstile → your site (public key). Unset = form skips the widget entirely. |
| `NEXT_PUBLIC_SUPABASE_URL` | already set | counter component uses it for the REST view query |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | already set | same |

## Resend domain setup (one-time)

The `from` address is `hello@chop-it.com`. The DNS for `chop-it.com` lives
at Namecheap. To send mail via Resend:

1. Sign up at resend.com
2. Add domain `chop-it.com`
3. Resend will show SPF + DKIM TXT records (and an optional DMARC)
4. Add those records at Namecheap (DNS → Advanced DNS for chop-it.com).
   **If chop-it.com already has an SPF record** (e.g. for ImprovMX),
   merge the Resend `include:` clause into the existing record. Resend's
   docs cover this.
5. Wait for verification (<10 min usually). Test send from Resend dashboard.
6. Copy the Resend API key → `RESEND_API_KEY` secret in Supabase.

## Cloudflare Turnstile setup (one-time)

1. cloudflare.com → Turnstile → Add site
2. Domain: `chop-it.com`
3. Widget mode: **Managed**
4. Copy site key → Vercel `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (production +
   preview)
5. Copy secret key → Supabase function secret `TURNSTILE_SECRET`

## Exporting the waitlist

There's no admin UI in v1. Use the Supabase Table Editor or run:

```sql
SELECT email, posthog_distinct_id, utm_source, utm_medium, utm_campaign,
       referrer, landing_path, ip_country, created_at, unsubscribed_at
FROM public.marketing_waitlist
ORDER BY created_at DESC;
```

Export to CSV via the dashboard's download button.

## PostHog events emitted

| Event | When |
|---|---|
| `waitlist_submit_attempted` | Form submit clicked (even with bad email) |
| `waitlist_submit_succeeded` | 200 from the Edge Function |
| `waitlist_submit_failed` | 400 / 500 / network error. `error_type` distinguishes |
| `waitlist_sticky_shown` | Sticky bar transitions from hidden → visible (once per session) |
| `waitlist_sticky_dismissed` | User clicks the close button |

On `waitlist_submit_succeeded`, two PostHog Person properties are set:
`waitlist_member: true` and `waitlist_joined_at: <ISO timestamp>`.
Combined with the `identified_only` person-profile setting in
`instrumentation-client.ts`, this is what promotes an anonymous visitor
to an identified Person in PostHog.

## Anti-enumeration posture

- `waitlist-submit` returns 200 whether or not the email was already on
  the list (`already_subscribed: true` in the success body, but the HTTP
  status is identical).
- `waitlist-unsubscribe` returns the same plain HTML page for every
  request, regardless of whether the email existed or was already
  unsubscribed.
- Base table has RLS enabled with no policies, so the anon key can't
  read it. Only `public.marketing_waitlist_count` (aggregate, no PII) is
  anon-readable.

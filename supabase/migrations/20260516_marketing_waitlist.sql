-- =========================================================================
-- Pre-launch email waitlist for chop-it.com.
--
-- Writes only via the waitlist-submit Edge Function (service-role client).
-- Anon role can read a single aggregate count via the view below — never
-- the base table, never PII.
--
-- Apply via Supabase Dashboard → SQL Editor → paste this whole file →
-- Run. Or via supabase CLI: `supabase db push` after linking the project.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.marketing_waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  -- Stored generated column so the unique index is bullet-proof against
  -- whitespace / casing variants ("Alex@…" vs "alex@…").
  email_normalized text GENERATED ALWAYS AS (lower(trim(email))) STORED,
  posthog_distinct_id text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  referrer text,
  landing_path text,
  user_agent text,
  ip_country text,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT marketing_waitlist_email_format
    CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

CREATE UNIQUE INDEX IF NOT EXISTS marketing_waitlist_email_normalized_uniq
  ON public.marketing_waitlist (email_normalized);

CREATE INDEX IF NOT EXISTS marketing_waitlist_created_at_idx
  ON public.marketing_waitlist (created_at DESC);

ALTER TABLE public.marketing_waitlist ENABLE ROW LEVEL SECURITY;
-- No RLS policies on the base table — RLS-enabled-with-no-policies is the
-- "deny all" stance for non-service-role connections. Only the
-- waitlist-submit Edge Function (using SUPABASE_SERVICE_ROLE_KEY) can read
-- or write this table.

-- Aggregate-only view for the social-proof counter. Anon-readable; cannot
-- be used to infer membership of any specific email.
CREATE OR REPLACE VIEW public.marketing_waitlist_count AS
  SELECT count(*)::int AS total
  FROM public.marketing_waitlist
  WHERE unsubscribed_at IS NULL;

GRANT SELECT ON public.marketing_waitlist_count TO anon;
GRANT SELECT ON public.marketing_waitlist_count TO authenticated;

-- Rollback (manual; this repo treats migrations as forward-only):
--   DROP VIEW  IF EXISTS public.marketing_waitlist_count;
--   DROP TABLE IF EXISTS public.marketing_waitlist;

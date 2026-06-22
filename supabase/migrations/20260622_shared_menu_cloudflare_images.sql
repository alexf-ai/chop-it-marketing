-- =========================================================================
-- Fix missing recipe images on /m/<share_code> menu shares.
--
-- The marketing site renders shared menus via the public.get_shared_menu
-- SECURITY DEFINER RPC. The previous version resolved each recipe's image
-- through a single COALESCE over a handful of keys and returned only a
-- pre-baked `image_url`. Two problems left ~6% of menu tiles imageless:
--
--   1. user_recipes.data stores the image under several inconsistent keys.
--      The dominant key is the camelCase `cloudflareImageId` (773 rows) and
--      `imageUrl` (566 rows) — neither was read. Only `image_url` /
--      `image.url` were, so most user recipes fell through to NULL.
--   2. The empty string is used in place of NULL for missing images, so a
--      bare COALESCE happily returned '' and short-circuited later, better
--      candidates. Every branch is now wrapped in NULLIF(..., '').
--
-- This version additionally surfaces the raw `cloudflare_image_id` and
-- `image_key` so the marketing renderer can build a Cloudflare Images
-- delivery URL at render time (matching the PWA-side fix), and a published
-- recipe `slug` so menu tiles can link to the on-site SEO recipe page.
--
-- Apply via Supabase Dashboard → SQL Editor, or `supabase db push`.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_shared_menu(p_share_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_collection_id uuid;
  v_result jsonb;
BEGIN
  SELECT sm.collection_id INTO v_collection_id
  FROM shared_menus sm
  WHERE sm.share_code = p_share_code
  LIMIT 1;

  IF v_collection_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'share_code', p_share_code,
    'collection', jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'kind', c.kind,
      'created_at', c.created_at
    ),
    'recipes', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', rc.recipe_id,
            'title', COALESCE(
              NULLIF(ur.data->>'name', ''),
              NULLIF(ur.data->>'title', ''),
              NULLIF(rp.title, ''),
              NULLIF(pr.title, ''),
              NULLIF(pr.data->>'name', ''),
              NULLIF(pr.data->>'title', '')
            ),
            -- Pre-resolved delivery URL when one exists. Empty strings are
            -- treated as absent so a blank user image_url can't mask a
            -- usable cloudflare id. Both snake_case and camelCase user-recipe
            -- keys are covered.
            'image_url', COALESCE(
              NULLIF(ur.data->>'image_url', ''),
              NULLIF(ur.data->>'imageUrl', ''),
              NULLIF(ur.data->'image'->>'url', ''),
              NULLIF(rp.image_url, ''),
              NULLIF(pr.primary_image_url, ''),
              NULLIF(pr.data->>'image_url', '')
            ),
            -- Raw Cloudflare Images id so the renderer can build a delivery
            -- URL when no pre-baked image_url is present.
            'cloudflare_image_id', COALESCE(
              NULLIF(ur.data->>'cloudflareImageId', ''),
              NULLIF(ur.data->>'cloudflare_image_id', ''),
              NULLIF(rp.cloudflare_image_id, '')
            ),
            -- image_key is "<id>/<variant>" (e.g. "<uuid>/full"); a second
            -- way to reach the same asset.
            'image_key', COALESCE(
              NULLIF(ur.data->>'image_key', ''),
              NULLIF(ur.data->>'imageKey', ''),
              NULLIF(rp.image_key, '')
            ),
            'cuisine', COALESCE(
              NULLIF(ur.data->>'cuisine', ''),
              NULLIF(rp.tags_json->'core'->>0, ''),
              NULLIF(pr.data->>'cuisine', '')
            ),
            'servings', COALESCE(
              NULLIF(ur.data->>'servings','')::int,
              rp.servings,
              NULLIF(pr.data->>'servings','')::int
            ),
            'total_minutes', COALESCE(
              NULLIF(ur.data->'timings'->>'total_minutes','')::int,
              NULLIF(ur.data->>'total_minutes','')::int,
              NULLIF(rp.timings_json->>'total_minutes','')::int,
              NULLIF(pr.data->'timings'->>'total_minutes','')::int
            ),
            -- Only published recipes that are live on the marketing site get
            -- an on-site slug; everything else links out to the app.
            'slug', CASE
              WHEN rp.id IS NOT NULL AND rp.seo_published IS TRUE
                   AND rp.deleted_at IS NULL THEN rp.slug
              ELSE NULL
            END,
            'source', CASE
              WHEN ur.id IS NOT NULL THEN 'user'
              WHEN rp.id IS NOT NULL THEN 'published'
              WHEN pr.id IS NOT NULL THEN 'public'
              ELSE 'unknown'
            END
          )
          ORDER BY rc.added_at NULLS LAST
        )
        FROM recipe_collections rc
        LEFT JOIN user_recipes ur        ON ur.id::text = rc.recipe_id
        LEFT JOIN recipes_published rp   ON rp.id::text = rc.recipe_id
        LEFT JOIN public_recipes pr      ON pr.id::text = rc.recipe_id
        WHERE rc.collection_id = v_collection_id
          AND (ur.id IS NOT NULL OR rp.id IS NOT NULL OR pr.id IS NOT NULL)
      ),
      '[]'::jsonb
    )
  )
  INTO v_result
  FROM collections c
  WHERE c.id = v_collection_id;

  RETURN v_result;
END;
$function$;

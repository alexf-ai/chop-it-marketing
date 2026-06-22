-- =========================================================================
-- Full recipe content for a shared menu, for editorial / blog surfaces.
--
-- get_shared_menu() returns just enough to render a tile (title, image,
-- cuisine, time). The interactive "This week's dinners" blog post needs the
-- whole recipe — ingredients (flat + grouped), method steps and tags — so it
-- can render each salad's full detail and emit Recipe JSON-LD for SEO.
--
-- Same access model as get_shared_menu: SECURITY DEFINER so the marketing
-- site reads it on the anon key (user_recipes is RLS-protected). Returns
-- NULL when the share code doesn't exist.
--
-- Field shapes are passed through largely as stored and normalised on the
-- TypeScript side, because the three recipe sources disagree on casing and
-- structure:
--   - user_recipes.data  : ingredients[] (strings), ingredientGroups[]
--                          ({title, items[]}), method[] (strings), tags[].
--   - recipes_published  : ingredients_json[] ({display}), method_steps_json[]
--                          ({text}), tags_json.core[].
--   - public_recipes.data: best-effort from the embedded jsonb.
--
-- Apply via Supabase Dashboard → SQL Editor, or `supabase db push`.
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_menu_recipes_full(p_share_code text)
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
            'description', COALESCE(
              NULLIF(ur.data->>'description', ''),
              NULLIF(rp.hero_description, ''),
              NULLIF(pr.data->>'description', '')
            ),
            'image_url', COALESCE(
              NULLIF(ur.data->>'image_url', ''),
              NULLIF(ur.data->>'imageUrl', ''),
              NULLIF(ur.data->'image'->>'url', ''),
              NULLIF(rp.image_url, ''),
              NULLIF(pr.primary_image_url, ''),
              NULLIF(pr.data->>'image_url', '')
            ),
            'cloudflare_image_id', COALESCE(
              NULLIF(ur.data->>'cloudflareImageId', ''),
              NULLIF(ur.data->>'cloudflare_image_id', ''),
              NULLIF(rp.cloudflare_image_id, '')
            ),
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
              NULLIF(ur.data->>'timeMinutes','')::int,
              NULLIF(ur.data->>'totalTime','')::int,
              NULLIF(ur.data->'timings'->>'total_minutes','')::int,
              NULLIF(ur.data->>'total_minutes','')::int,
              NULLIF(rp.timings_json->>'total_minutes','')::int,
              NULLIF(pr.data->'timings'->>'total_minutes','')::int
            ),
            'tags', COALESCE(
              CASE WHEN jsonb_typeof(ur.data->'tags') = 'array' THEN ur.data->'tags' END,
              CASE WHEN jsonb_typeof(rp.tags_json->'core') = 'array' THEN rp.tags_json->'core' END,
              CASE WHEN jsonb_typeof(pr.data->'tags') = 'array' THEN pr.data->'tags' END,
              '[]'::jsonb
            ),
            'ingredients', COALESCE(
              CASE WHEN jsonb_typeof(ur.data->'ingredients') = 'array' THEN ur.data->'ingredients' END,
              CASE WHEN jsonb_typeof(rp.ingredients_json) = 'array' THEN rp.ingredients_json END,
              CASE WHEN jsonb_typeof(pr.data->'ingredients') = 'array' THEN pr.data->'ingredients' END,
              '[]'::jsonb
            ),
            'ingredient_groups', COALESCE(
              CASE WHEN jsonb_typeof(ur.data->'ingredientGroups') = 'array' THEN ur.data->'ingredientGroups' END,
              CASE WHEN jsonb_typeof(ur.data->'ingredient_groups') = 'array' THEN ur.data->'ingredient_groups' END,
              '[]'::jsonb
            ),
            'method', COALESCE(
              CASE WHEN jsonb_typeof(ur.data->'method') = 'array' THEN ur.data->'method' END,
              CASE WHEN jsonb_typeof(ur.data->'steps') = 'array' THEN ur.data->'steps' END,
              CASE WHEN jsonb_typeof(rp.method_steps_json) = 'array' THEN rp.method_steps_json END,
              CASE WHEN jsonb_typeof(pr.data->'method') = 'array' THEN pr.data->'method' END,
              CASE WHEN jsonb_typeof(pr.data->'steps') = 'array' THEN pr.data->'steps' END,
              '[]'::jsonb
            ),
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

-- Anon needs EXECUTE to call it on the marketing site's anon key.
GRANT EXECUTE ON FUNCTION public.get_menu_recipes_full(text) TO anon;

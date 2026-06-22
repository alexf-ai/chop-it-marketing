'use client';

// Interactive explorer for the "This week's dinners" salad post.
//
// Renders every salad as a card you can click to expand its full ingredients
// and method. The detail panel for each card is always present in the DOM
// (toggled with the `hidden` attribute, not unmounted) so the ingredients and
// method are in the server-rendered HTML and stay indexable — the
// interactivity is pure progressive enhancement over content that's already
// there.
//
// A search box and cuisine chips filter the grid client-side; with ~50 salads
// that's the difference between a wall and something you can actually browse.

import { useMemo, useState } from 'react';

import type { FullMenuRecipe } from '@/app/lib/menuRecipes';

type Props = {
  recipes: FullMenuRecipe[];
  // On-site shared-menu page (/m/<code>) — the established "send the whole
  // list to Chop It" journey the app handoff lives on.
  menuUrl: string;
};

// First tag is the cuisine by the app's convention ("British", "Asian", …).
function cuisineOf(recipe: FullMenuRecipe): string | null {
  const first = recipe.tags[0];
  return first ? first : null;
}

export default function SaladExplorer({ recipes, menuUrl }: Props) {
  const [query, setQuery] = useState('');
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const cuisines = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of recipes) {
      const c = cuisineOf(r);
      if (c) counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name]) => name);
  }, [recipes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      if (cuisine && cuisineOf(r) !== cuisine) return false;
      if (!q) return true;
      if (r.title.toLowerCase().includes(q)) return true;
      return r.ingredients.some((i) => i.toLowerCase().includes(q));
    });
  }, [recipes, query, cuisine]);

  return (
    <div className="salad-explorer">
      <div className="salad-controls">
        <input
          type="search"
          className="salad-search"
          placeholder="Search 49 salads or an ingredient…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search salads by name or ingredient"
        />
        <div className="salad-chips" role="group" aria-label="Filter by cuisine">
          <button
            type="button"
            className={`salad-chip${cuisine === null ? ' is-active' : ''}`}
            onClick={() => setCuisine(null)}
            aria-pressed={cuisine === null}
          >
            All
          </button>
          {cuisines.map((c) => (
            <button
              key={c}
              type="button"
              className={`salad-chip${cuisine === c ? ' is-active' : ''}`}
              onClick={() => setCuisine((prev) => (prev === c ? null : c))}
              aria-pressed={cuisine === c}
            >
              {c}
            </button>
          ))}
        </div>
        <p className="salad-count mono" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'salad' : 'salads'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="salad-empty">No salads match that — try another search.</p>
      ) : (
        <ol className="salad-grid">
          {filtered.map((r) => {
            const n = recipes.indexOf(r) + 1;
            const open = openId === r.id;
            const detailId = `salad-detail-${r.id}`;
            const meta = [
              r.total_minutes ? `${r.total_minutes} min` : null,
              r.servings ? `Serves ${r.servings}` : null,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <li key={r.id} id={`salad-${r.id}`} className="salad-card">
                <button
                  type="button"
                  className="salad-card-trigger"
                  aria-expanded={open}
                  aria-controls={detailId}
                  onClick={() => setOpenId((prev) => (prev === r.id ? null : r.id))}
                >
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.image_url}
                      alt={r.title}
                      loading="lazy"
                      className="salad-card-img"
                    />
                  ) : (
                    <div className="salad-card-img salad-card-img-fallback" aria-hidden />
                  )}
                  <span className="salad-card-num mono">{n.toString().padStart(2, '0')}</span>
                  <span className="salad-card-body">
                    <span className="salad-card-title">{r.title}</span>
                    {meta ? <span className="salad-card-meta mono">{meta}</span> : null}
                    <span className="salad-card-cue mono">{open ? 'Hide recipe −' : 'See recipe +'}</span>
                  </span>
                </button>

                <div id={detailId} className="salad-card-detail" hidden={!open}>
                  <div className="salad-detail-cols">
                    <section className="salad-detail-ingredients">
                      <h4 className="salad-detail-h">Ingredients</h4>
                      {r.ingredientGroups.length > 0 ? (
                        r.ingredientGroups.map((g, gi) => (
                          <div key={gi} className="salad-ing-group">
                            {g.title ? (
                              <div className="salad-ing-group-title mono">{g.title}</div>
                            ) : null}
                            <ul className="salad-ing-list">
                              {g.items.map((item, ii) => (
                                <li key={ii}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        ))
                      ) : (
                        <ul className="salad-ing-list">
                          {r.ingredients.map((item, ii) => (
                            <li key={ii}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </section>

                    <section className="salad-detail-method">
                      <h4 className="salad-detail-h">Method</h4>
                      <ol className="salad-method-list">
                        {r.method.map((step, si) => (
                          <li key={si}>{step}</li>
                        ))}
                      </ol>
                    </section>
                  </div>

                  <a className="btn btn-primary salad-detail-cta" href={menuUrl}>
                    Add the whole list to Chop It →
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

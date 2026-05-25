'use client';

// Interactive phone simulator for the homepage hero. Three tabs:
//   This Week → animated score ring + 5 recipe cards (initialRecipes,
//               pre-fetched server-side so the HTML stays SEO-friendly).
//   Shop     → ingredient list derived from those 5 recipes, grouped
//              by a tiny keyword classifier. Pure client derivation,
//              no extra fetch.
//   Pantry   → mock pantry chips + 3 "READY" recipe cards fetched on
//              first tab activation via search_public_recipes RPC.
//
// Recipe card clicks open /recipes/[slug] in a new tab so the simulator
// keeps its state when the visitor comes back. Tab + recipe + search
// interactions emit PostHog events (lib/posthog-events.ts).

import Image from 'next/image';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

import {
  trackDemoRecipeClicked,
  trackDemoTabSwitched,
  type DemoTab,
} from '@/lib/posthog-events';

import ScoreRing from '../ScoreRing';
import type {
  DemoIngredient,
  DemoPantryRecipe,
  DemoRecipe,
} from '@/app/lib/homepageDemo';

type Props = {
  initialRecipes: DemoRecipe[];
  pantryRecipes: DemoPantryRecipe[];
  score?: number;
  band?: string;
};

const TABS: { id: DemoTab; label: string }[] = [
  { id: 'this_week', label: 'This Week' },
  { id: 'shop', label: 'Shop' },
  { id: 'pantry', label: 'Pantry' },
];

const PANTRY_MOCK = [
  'chicken',
  'eggs',
  'rice',
  'tomatoes',
  'onions',
  'garlic',
  'olive oil',
  'pasta',
  'lemon',
  'spinach',
];

// Keyword classifier for the Shop tab. Substring match against the
// lowercased canonical ingredient name. Order matters: protein/dairy
// wins over the broad produce check.
const PROTEIN_KEYWORDS = [
  'chicken',
  'beef',
  'pork',
  'lamb',
  'fish',
  'salmon',
  'cod',
  'prawn',
  'egg',
  'tofu',
  'halloumi',
];
const DAIRY_KEYWORDS = [
  'milk',
  'cream',
  'butter',
  'yoghurt',
  'yogurt',
  'cheese',
  'parmesan',
  'feta',
  'mozzarella',
];
const PRODUCE_KEYWORDS = [
  'fresh',
  'tomato',
  'onion',
  'garlic',
  'spinach',
  'lemon',
  'lime',
  'pepper',
  'chilli',
  'carrot',
  'celery',
  'potato',
  'kale',
  'cucumber',
  'avocado',
  'broccoli',
  'mushroom',
  'leek',
  'apple',
  'banana',
  'herb',
  'parsley',
  'coriander',
  'basil',
  'mint',
  'rocket',
  'leaf',
  'salad',
];

type ShopSection = 'Protein' | 'Produce' | 'Dairy' | 'Pantry';

function classify(name: string): ShopSection {
  const lower = name.toLowerCase();
  if (PROTEIN_KEYWORDS.some((k) => lower.includes(k))) return 'Protein';
  if (DAIRY_KEYWORDS.some((k) => lower.includes(k))) return 'Dairy';
  if (PRODUCE_KEYWORDS.some((k) => lower.includes(k))) return 'Produce';
  return 'Pantry';
}

function dedupeIngredients(recipes: DemoRecipe[]): DemoIngredient[] {
  const seen = new Map<string, DemoIngredient>();
  for (const r of recipes) {
    for (const ing of r.ingredients) {
      if (!seen.has(ing.canonical)) seen.set(ing.canonical, ing);
    }
  }
  return Array.from(seen.values());
}

function groupForShop(recipes: DemoRecipe[]): Record<ShopSection, DemoIngredient[]> {
  const deduped = dedupeIngredients(recipes);
  const groups: Record<ShopSection, DemoIngredient[]> = {
    Protein: [],
    Produce: [],
    Dairy: [],
    Pantry: [],
  };
  for (const ing of deduped) {
    groups[classify(ing.canonical)].push(ing);
  }
  for (const k of Object.keys(groups) as ShopSection[]) {
    groups[k].sort((a, b) => a.canonical.localeCompare(b.canonical));
  }
  return groups;
}

function formatMinutes(min: number | null): string | null {
  if (min == null || min <= 0) return null;
  return `${min} min`;
}

function RecipeCard({
  recipe,
  tab,
  badge,
}: {
  recipe: { slug: string; title: string; image_url: string | null; total_minutes: number | null };
  tab: DemoTab;
  badge?: 'ready';
}) {
  const time = formatMinutes(recipe.total_minutes);
  return (
    <a
      className="sim-card"
      href={`/recipes/${recipe.slug}`}
      target="_blank"
      rel="noopener"
      onClick={() => trackDemoRecipeClicked({ slug: recipe.slug, tab })}
    >
      <div className="sim-card-img">
        {recipe.image_url && (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            width={120}
            height={120}
            sizes="56px"
          />
        )}
        {badge === 'ready' && <span className="sim-card-badge">READY</span>}
      </div>
      <div className="sim-card-body">
        <div className="sim-card-title">{recipe.title}</div>
        {time && <div className="sim-card-time mono">{time}</div>}
      </div>
      <div className="sim-card-chev" aria-hidden="true">
        ›
      </div>
    </a>
  );
}

function ThisWeekTab({
  recipes,
  score,
  band,
}: {
  recipes: DemoRecipe[];
  score: number;
  band: string;
}) {
  // `recipes` is a required server-fetched prop (always an array in prod), but
  // React Fast Refresh can re-render this client island with undefined props
  // during dev HMR — the source of the captured TypeError. Bail rather than crash.
  if (!recipes) return null;
  return (
    <>
      <div className="phone-score-card">
        <ScoreRing score={score} size={156} compact />
        <div className="phone-score-side">
          <div className="phone-score-kicker mono">WEEKLY DIVERSITY</div>
          <div
            className="phone-score-band"
            aria-label={`Weekly Diversity Score ${score} out of 100, ${band}`}
          >
            {band}
          </div>
          <div className="phone-pillars">
            <span className="pill pill-plants">Plants</span>
            <span className="pill pill-fibre">Fibre</span>
            <span className="pill pill-protein">Protein</span>
          </div>
        </div>
      </div>
      <div className="phone-meals-head">
        <span className="mono">THIS WEEK&rsquo;S MEALS</span>
        <span className="phone-meals-more">{recipes.length} of {recipes.length}</span>
      </div>
      <div className="sim-cards">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} tab="this_week" />
        ))}
      </div>
    </>
  );
}

function ShopTab({ recipes }: { recipes: DemoRecipe[] }) {
  const groups = useMemo(() => groupForShop(recipes), [recipes]);
  // Local checkbox state — a Set of canonical names that are ticked. No
  // persistence; the demo resets on reload.
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  const toggle = useCallback((canonical: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(canonical)) next.delete(canonical);
      else next.add(canonical);
      return next;
    });
  }, []);

  return (
    <>
      <div className="sim-shop-caption mono">GENERATED FROM THIS WEEK&rsquo;S RECIPES</div>
      {(Object.keys(groups) as ShopSection[])
        .filter((k) => groups[k].length > 0)
        .map((k) => (
          <div key={k} className="sim-shop-section">
            <div className="sim-shop-section-h mono">{k}</div>
            <ul className="sim-shop-list">
              {groups[k].map((ing) => {
                const id = `shop-${ing.canonical.replace(/[^a-z0-9]+/g, '-')}`;
                const isChecked = checked.has(ing.canonical);
                return (
                  <li key={ing.canonical}>
                    <label className="sim-shop-item" htmlFor={id}>
                      <input
                        id={id}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(ing.canonical)}
                      />
                      <span className={isChecked ? 'sim-shop-name checked' : 'sim-shop-name'}>
                        {ing.canonical}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
    </>
  );
}

function PantryTab({ recipes }: { recipes: DemoPantryRecipe[] }) {
  return (
    <>
      <div className="sim-pantry-caption mono">IN YOUR PANTRY</div>
      <div className="sim-pantry-chips">
        {PANTRY_MOCK.map((item) => (
          <span key={item} className="sim-pantry-chip">
            {item}
          </span>
        ))}
      </div>
      <div className="phone-meals-head">
        <span className="mono">RECIPES YOU CAN MAKE NOW</span>
      </div>
      <div className="sim-cards">
        {recipes.length > 0 ? (
          recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} tab="pantry" badge="ready" />
          ))
        ) : (
          <div className="sim-pantry-loading muted">No matches right now.</div>
        )}
      </div>
    </>
  );
}

export default function PhoneSimulator({
  initialRecipes,
  pantryRecipes,
  score = 78,
  band = 'Good',
}: Props) {
  const [tab, setTab] = useState<DemoTab>('this_week');
  const tabsRef = useRef<HTMLDivElement | null>(null);

  const handleTab = useCallback((next: DemoTab) => {
    if (next === tab) return;
    setTab(next);
    trackDemoTabSwitched({ tab: next });
  }, [tab]);

  const onTabKey = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, idx: number) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const dir = e.key === 'ArrowRight' ? 1 : -1;
        const nextIdx = (idx + dir + TABS.length) % TABS.length;
        const nextId = TABS[nextIdx].id;
        setTab(nextId);
        trackDemoTabSwitched({ tab: nextId });
        // Move focus to the newly selected tab.
        const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
        buttons?.[nextIdx]?.focus();
      }
    },
    [],
  );

  return (
    <div className="phone sim-phone">
      <div className="phone-notch" />
      <div className="phone-screen">
        <div className="phone-status">
          <span className="mono">9:41</span>
          <span className="phone-status-right">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </span>
        </div>

        <div
          className="phone-tabs"
          role="tablist"
          aria-label="App preview"
          ref={tabsRef}
        >
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`sim-tab-${t.id}`}
              aria-controls={`sim-panel-${t.id}`}
              aria-selected={tab === t.id}
              tabIndex={tab === t.id ? 0 : -1}
              className={tab === t.id ? 'tab on' : 'tab'}
              onClick={() => handleTab(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id="sim-panel-this_week"
          aria-labelledby="sim-tab-this_week"
          hidden={tab !== 'this_week'}
        >
          {tab === 'this_week' && (
            <ThisWeekTab recipes={initialRecipes} score={score} band={band} />
          )}
        </div>
        <div
          role="tabpanel"
          id="sim-panel-shop"
          aria-labelledby="sim-tab-shop"
          hidden={tab !== 'shop'}
        >
          {tab === 'shop' && <ShopTab recipes={initialRecipes} />}
        </div>
        <div
          role="tabpanel"
          id="sim-panel-pantry"
          aria-labelledby="sim-tab-pantry"
          hidden={tab !== 'pantry'}
        >
          {tab === 'pantry' && <PantryTab recipes={pantryRecipes} />}
        </div>
      </div>
    </div>
  );
}

'use client';

// Search bar above the phone simulator. Submits via router.push to
// /recipes?q=… — that route is fully SSR'd in Phase 2, so every
// submission produces a unique, crawlable URL. The bar itself is plain
// HTML; the only client work is the keystroke handler + posthog ping.

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { trackDemoSearchSubmitted } from '@/lib/posthog-events';

export default function DemoSearchBar() {
  const router = useRouter();
  const [value, setValue] = useState('');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    trackDemoSearchSubmitted({ query_length: q.length });
    router.push(`/recipes?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="demo-search">
      <h2 className="demo-search-h">Try it. What&rsquo;s in your fridge?</h2>
      <form className="demo-search-form" onSubmit={onSubmit} role="search">
        <label className="demo-search-label" htmlFor="demo-search-q">
          Search recipes
        </label>
        <input
          id="demo-search-q"
          className="demo-search-input"
          type="search"
          name="q"
          placeholder="e.g. chicken, salmon, halloumi…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="demo-search-submit" disabled={value.trim().length === 0}>
          Search
        </button>
      </form>
    </div>
  );
}

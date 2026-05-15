// Server component. Shared grid used by the hub + every taxonomy page
// (cuisine / season / tag). Reuses the existing .recipes-grid + .recipe-card
// styles from globals.css so it inherits the homepage's 2-col mobile /
// 3-col tablet / 4-col desktop layout.

import Image from 'next/image';
import Link from 'next/link';

import type { RecipeListItem } from '@/app/lib/recipes';

const COST_DOT_COLOR: Record<string, string> = {
  low: 'var(--green)',
  mid: 'var(--amber)',
  high: 'var(--pink)',
};

function formatTotalTime(minutes: number | null | undefined): string | null {
  if (minutes == null || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export default function RecipeGrid({ items }: { items: RecipeListItem[] }) {
  if (items.length === 0) {
    return (
      <p className="recipe-grid-empty muted">
        No recipes here yet. Check back soon.
      </p>
    );
  }
  return (
    <div className="recipes-grid">
      {items.map((r) => {
        const time = formatTotalTime(r.total_minutes);
        const dot = r.cost_band ? COST_DOT_COLOR[r.cost_band] : null;
        return (
          <Link key={r.id} className="recipe-card" href={`/recipes/${r.slug}`}>
            <div className="recipe-image">
              {r.image_url && (
                <Image
                  src={r.image_url}
                  alt={r.title}
                  width={600}
                  height={600}
                  sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"
                />
              )}
            </div>
            <div className="recipe-meta">
              <div className="recipe-name">{r.title}</div>
              {(time || dot) && (
                <div className="recipe-card-bottom mono">
                  {time && <span>{time}</span>}
                  {dot && (
                    <span
                      className="cost-dot"
                      aria-label={`${r.cost_band} cost`}
                      style={{ background: dot }}
                    />
                  )}
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

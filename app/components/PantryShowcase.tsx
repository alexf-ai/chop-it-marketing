import Image from 'next/image';

import { formatQty, getGuestPantry, statusFor, type PantryItem, type PantryStatus } from '@/app/lib/pantry';

export const revalidate = 3600;

function Badge({ status }: { status: PantryStatus }) {
  if (status.kind === 'none') return null;
  if (status.kind === 'use_today') return <span className="pantry-badge pantry-badge-use-today">Use today</span>;
  if (status.kind === 'days_left')
    return (
      <span className="pantry-badge pantry-badge-days-left">{status.daysLeft} day{status.daysLeft === 1 ? '' : 's'} left</span>
    );
  return <span className="pantry-badge pantry-badge-fresh">Fresh</span>;
}

function Card({ item }: { item: PantryItem }) {
  const status = statusFor(item.expiry_date);
  const initial = item.name.trim().charAt(0).toUpperCase();
  return (
    <div className="pantry-card">
      <div className="pantry-card-photo">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            width={320}
            height={320}
            sizes="(max-width: 640px) 40vw, 160px"
          />
        ) : (
          <div className="pantry-card-photo-fallback" aria-hidden="true">
            {initial}
          </div>
        )}
        <div className="pantry-card-name">{item.name}</div>
        <Badge status={status} />
      </div>
      <div className="pantry-card-qty mono">{formatQty(item.quantity, item.unit)}</div>
    </div>
  );
}

export default async function PantryShowcase() {
  const items = await getGuestPantry();

  if (items.length === 0) {
    console.warn('[PantryShowcase] no items returned — guest pantry empty or env missing');
    return null;
  }

  return (
    <div className="pantry-scroll" role="list" aria-label="Guest pantry preview">
      {items.map((it) => (
        <div key={it.id} role="listitem">
          <Card item={it} />
        </div>
      ))}
    </div>
  );
}

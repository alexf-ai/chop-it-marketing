import { supabase, supabaseConfigured } from './supabase';

const GUEST_PANTRY_ACCOUNT = 'ZG7B41PRK67NEYXW02M864TV2J';

export type PantryItem = {
  id: string;
  name: string;
  location: string | null;
  quantity: number | null;
  unit: string | null;
  expiry_date: string | null;
  image_url: string | null;
};

export type PantryStatus =
  | { kind: 'use_today' }
  | { kind: 'days_left'; daysLeft: number }
  | { kind: 'fresh' }
  | { kind: 'none' };

export async function getGuestPantry(): Promise<PantryItem[]> {
  if (!supabase || !supabaseConfigured) return [];

  const { data: items, error } = await supabase
    .from('pantry_items')
    .select('id, name, location, quantity, unit, expiry_date, created_at')
    .eq('owner_account_code', GUEST_PANTRY_ACCOUNT)
    .order('created_at', { ascending: false });

  if (error || !items || items.length === 0) {
    if (error) console.warn('[PantryShowcase] pantry_items query error', error.message);
    return [];
  }

  // Icons live in a separate table keyed by lower(name). Two-step fetch is fine
  // — there are only ~360 names and the icon table fits in one round trip.
  const lowerNames = Array.from(
    new Set(items.map((i) => (i.name as string).toLowerCase())),
  );

  const { data: icons } = await supabase
    .from('ingredient_icons')
    .select('name, image_url')
    .in('name', lowerNames);

  const iconByName = new Map<string, string>();
  for (const icon of icons ?? []) {
    if (icon.image_url) iconByName.set((icon.name as string).toLowerCase(), icon.image_url as string);
  }

  return items.map((it) => ({
    id: it.id as string,
    name: it.name as string,
    location: (it.location as string | null) ?? null,
    quantity: (it.quantity as number | null) ?? null,
    unit: (it.unit as string | null) ?? null,
    expiry_date: (it.expiry_date as string | null) ?? null,
    image_url: iconByName.get((it.name as string).toLowerCase()) ?? null,
  }));
}

export function statusFor(expiryDate: string | null, today: Date = new Date()): PantryStatus {
  if (!expiryDate) return { kind: 'none' };
  const exp = new Date(expiryDate);
  const ms = exp.getTime() - today.getTime();
  const days = Math.ceil(ms / 86_400_000);
  if (days <= 0) return { kind: 'use_today' };
  if (days <= 3) return { kind: 'days_left', daysLeft: days };
  return { kind: 'fresh' };
}

const COMPACT_UNITS = new Set(['g', 'kg', 'mg', 'ml', 'l']);

export function formatQty(qty: number | null, unit: string | null): string {
  if (qty == null) return '';
  if (!unit) return String(qty);
  return COMPACT_UNITS.has(unit.toLowerCase()) ? `${qty}${unit}` : `${qty} ${unit}`;
}

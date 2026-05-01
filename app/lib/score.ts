// Helpers for the Weekly Diversity Score — exact port of ring.jsx's bandFor/coachingFor/BRAND.

export const BRAND = {
  protein: '#E8547A',
  fibre: '#F5A623',
  plants: '#6DC56E',
} as const;

export const ACCENTS = {
  pink:   '#E8547A',
  amber:  '#F5A623',
  green:  '#6DC56E',
  purple: '#7F77DD',
} as const;

export type AccentKey = keyof typeof ACCENTS;

export function bandFor(score: number): string {
  if (score >= 76) return 'Excellent';
  if (score >= 63) return 'Good';
  if (score >= 45) return 'Decent';
  return 'Needs work';
}

export function coachingFor(score: number): string {
  if (score >= 76) return 'Strong on plants and fibre. One fish swap would push you to Excellent.';
  if (score >= 63) return 'Strong week. One plant swap would make it great.';
  if (score >= 45) return 'Decent base. Fibre is the gap — easy to fix before you shop.';
  return 'Heavy on red meat this week — here\u2019s how to balance it out.';
}

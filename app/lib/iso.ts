// Small pure helpers used by the SEO recipe pipeline.
//
// isoDuration(minutes) — minutes → ISO 8601 duration string ("PT12M").
//   schema.org Recipe wants prepTime/cookTime/totalTime in ISO 8601.
//   Returns undefined for null/0/negative/non-finite input so the caller
//   can drop the key entirely instead of emitting "PT0M".
//
// stripUndefined(obj) — shallow clone with `undefined` keys removed.
//   JSON.stringify already drops `undefined` values, but JSON-LD payloads
//   read more cleanly when the object itself has no undefined entries
//   (matters for snapshot tests, dev-tools inspection).

export function isoDuration(minutes: number | null | undefined): string | undefined {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return undefined;
  return `PT${Math.round(minutes)}M`;
}

export function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

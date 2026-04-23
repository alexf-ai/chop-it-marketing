// Subtly striped SVG placeholders labelled with the dish name in mono.
// Used in place of real food photography until imagery is dropped in.

type Tone = 'warm' | 'herb' | 'berry' | 'amber' | 'smoke';

type DishPlaceholderProps = {
  label: string;
  tone?: Tone;
  aspect?: string;
  className?: string;
};

const palettes: Record<Tone, [string, string]> = {
  warm:  ['#1a1714', '#221d18'],
  herb:  ['#161a14', '#1e231c'],
  berry: ['#1a1416', '#22181c'],
  amber: ['#1a1612', '#221c16'],
  smoke: ['#151515', '#1e1e1e'],
};

// Stable pattern-id per (label, tone) so server and client renders match. djb2-ish hash.
function hashId(seed: string): string {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  return 'stripe-' + (h >>> 0).toString(36);
}

export default function DishPlaceholder({ label, tone = 'warm', aspect = '4 / 3', className = '' }: DishPlaceholderProps) {
  const [a, b] = palettes[tone] || palettes.warm;
  const id = hashId(`${label}|${tone}`);

  return (
    <div className={`dish-ph ${className}`} style={{ aspectRatio: aspect }}>
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 300">
        <defs>
          <pattern id={id} width={16} height={16} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width={16} height={16} fill={a} />
            <rect width={8} height={16} fill={b} />
          </pattern>
        </defs>
        <rect width={400} height={300} fill={`url(#${id})`} />
      </svg>
      <div className="dish-ph-label">
        <span className="mono">{label}</span>
      </div>
    </div>
  );
}
